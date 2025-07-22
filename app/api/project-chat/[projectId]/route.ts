import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DeveloperProfile, DeveloperProfileDataContent } from "@/lib/types";
import { getSession } from "@/lib/getSession";

// Helper function to validate MongoDB ObjectId format (keeping for backward compatibility)
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://andishi.dev' : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Helper function to get user details from Prisma
export async function getUserDetails(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
}

// Helper function to get project details from Prisma
export async function getProjectDetails(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: {
          where: {
            status: { in: ['pending', 'accepted'] } // Only active assignments
          },
          include: {
            developer: true,
          },
        },
      },
    });

    if (project) {
      console.log(`Found Prisma project:`, {
        id: project.id,
        title: (project.projectDetails as any)?.title || 'Untitled Project',
        clientId: project.clientId,
        maxTeamSize: project.maxTeamSize
      });

      console.log(`Found ${project.assignments.length} assignments:`, project.assignments.map((a: any) => ({
        id: a.id,
        projectId: a.projectId,
        status: a.status,
        developerId: a.developer?.userId,
        developerData: a.developer ? 'present' : 'missing'
      })));
    }

    return project;
  } catch (error) {
    console.error('Error fetching project details:', error);
    return null;
  }
}

// Helper function to create proper chat participants for a project
export async function createChatParticipants(project: any) {
  const participants: any[] = [];

  // 1. Add client as participant if clientId exists
  if (project.clientId) {
    const clientUser = await getUserDetails(project.clientId);
    if (clientUser) {
      participants.push({
        userId: clientUser.id,
        name: `${clientUser.firstName} ${clientUser.lastName}`.trim() || clientUser.email || "Client",
        role: "client",
        isOnline: false,
      });
    }
  }

  // 2. Add assigned developers as participants
  if (project.assignments && project.assignments.length > 0) {
    for (const assignment of project.assignments as any[]) {
      if (assignment.developer && assignment.developer.userId) {
        const developerUser = await getUserDetails(assignment.developer.userId);
        if (developerUser) {
          // Try to get name from developer profile data first
          const developerData = assignment.developer.data as unknown as DeveloperProfileDataContent;
          const firstName = developerData?.personalInfo?.firstName;
          const lastName = developerData?.personalInfo?.lastName;
          let developerName = (firstName && lastName) ? `${firstName} ${lastName}` : null;

          // Fallback to user details if no name in profile
          if (!developerName) {
            developerName = `${developerUser.firstName} ${developerUser.lastName}`.trim() || developerUser.email || "Developer";
          }

          participants.push({
            userId: assignment.developer.userId,
            name: developerName,
            role: "developer",
            isOnline: false,
          });
        }
      }
    }
  }

  return participants;
}

// GET /api/project-chat/{projectId} - Get chat messages for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Validate environment variables
    if (!process.env.JWT_SECRET) {
      console.error('GET /api/project-chat/[projectId] - JWT_SECRET not found in environment');
      return new NextResponse("Server configuration error", { status: 500, headers: corsHeaders });
    }

    if (!process.env.DATABASE_URL) {
      console.error('GET /api/project-chat/[projectId] - DATABASE_URL not found in environment');
      return new NextResponse("Server configuration error", { status: 500, headers: corsHeaders });
    }

    const { projectId } = await params;

    // Validate projectId is not empty
    if (!projectId || projectId.trim() === '') {
      console.error('GET /api/project-chat/[projectId] - Project ID is empty');
      return new NextResponse("Project ID is required", { status: 400, headers: corsHeaders });
    }

    // Validate ObjectId format (keeping for backward compatibility)
    if (!isValidObjectId(projectId)) {
      console.error(`GET /api/project-chat/[projectId] - Invalid ObjectId format: ${projectId}`);
      return new NextResponse("Invalid project ID format", { status: 400, headers: corsHeaders });
    }

    // Add authentication check
    const session = await getSession(req);
    if (!session || !session.user) {
      console.error(`GET /api/project-chat/[projectId] - Unauthorized access attempt for project ${projectId}`);
      console.error('Session details:', { session, hasSession: !!session, hasUser: !!session?.user });

      // Check if token exists
      const authHeader = req.headers.get('authorization');
      const cookieToken = req.cookies.get('auth_token')?.value;
      console.error('Token details:', { hasAuthHeader: !!authHeader, hasCookieToken: !!cookieToken });

      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    console.log(`GET /api/project-chat/[projectId] - User ${session.user.id} (${session.user.role}) accessing project ${projectId}`);

    // Get project details first (required for all users)
    const project = await getProjectDetails(projectId);

    if (!project) {
      console.error(`GET /api/project-chat/[projectId] - Project not found: ${projectId}`);
      return new NextResponse("Project not found", { status: 404, headers: corsHeaders });
    }

    // Check if user has access to this project
    const hasAccess =
      session.user.role === "admin" || // Admin can access all projects
      project.clientId === session.user.id || // Client can access their projects
      project.assignments.some((assignment: any) =>
        assignment.developer?.userId === session.user.id &&
        ['pending', 'accepted'].includes(assignment.status) // Only active assignments
      );

    if (!hasAccess) {
      console.error(`GET /api/project-chat/[projectId] - Access denied for user ${session.user.id} to project ${projectId}`);
      return new NextResponse("Access denied", { status: 403, headers: corsHeaders });
    }

    // Try to find existing chat
    let chat = await prisma.projectChat.findFirst({
      where: { projectId },
      include: {
        messages: {
          orderBy: {
            timestamp: "asc",
          },
        },
        participants: true,
      },
    });

    // If no chat exists, create one with default participants
    if (!chat) {
      console.log(`GET /api/project-chat/[projectId] - Creating new chat for project ${projectId}`);
      console.log(`Project details:`, {
        id: project.id,
        clientId: project.clientId,
        assignmentsCount: project.assignments.length,
        assignments: project.assignments.map((a: any) => ({
          id: a.id,
          status: a.status,
          developerId: a.developer?.userId
        }))
      });

      const participants: any[] = [];

      // Add client as participant if clientId exists
      if (project.clientId) {
        const clientUser = await getUserDetails(project.clientId);

        if (clientUser) {
          const clientName = `${clientUser.firstName} ${clientUser.lastName}`.trim() || clientUser.email || "Client";
          console.log(`Adding client participant:`, {
            userId: clientUser.id,
            name: clientName,
            firstName: clientUser.firstName,
            lastName: clientUser.lastName,
            email: clientUser.email
          });
          participants.push({
            userId: clientUser.id,
            name: clientName,
            role: "client",
            isOnline: false,
          });
        } else {
          console.log(`Client user not found for clientId: ${project.clientId}`);
        }
      }

      // Add developers as participants
      project.assignments.forEach((assignment: any) => {
        if (assignment.developer && assignment.developer.userId) {
          const developerData = assignment.developer.data as unknown as DeveloperProfileDataContent;
          const firstName = developerData?.personalInfo?.firstName;
          const lastName = developerData?.personalInfo?.lastName;
          const developerName = (firstName && lastName) ? `${firstName} ${lastName}` : "Developer";

          participants.push({
            userId: assignment.developer.userId,
            name: developerName,
            role: "developer",
            isOnline: false,
          });
        }
      });

      // Always add the current user as a participant if they're not already included
      if (!participants.some(p => p.userId === session.user.id)) {
        // Get user details for proper name display
        const currentUser = await getUserDetails(session.user.id);

        // Handle missing firstName/lastName by falling back to email or default
        let userName = "User";
        if (currentUser) {
          const firstName = currentUser.firstName || '';
          const lastName = currentUser.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();

          // If both names are missing, use email or default
          if (fullName) {
            userName = fullName;
          } else if (currentUser.email) {
            userName = currentUser.email.split('@')[0] || 'User';
          } else {
            userName = currentUser.role === 'admin' ? 'Admin User' : 'User';
          }
        } else {
          userName = session.user.name || session.user.email || "User";
        }

        console.log(`Adding current user as participant:`, {
          userId: session.user.id,
          name: userName,
          role: session.user.role,
          currentUserFound: !!currentUser,
          currentUserDetails: currentUser
        });

        participants.push({
          userId: session.user.id,
          name: userName,
          role: session.user.role,
          isOnline: true, // Current user is online
        });
      }

      console.log(`Final participants array before creating chat:`, participants);

      // Create the chat with transaction for atomicity
      chat = await prisma.$transaction(async (tx: any) => {
        const newChat = await tx.projectChat.create({
          data: {
            projectId,
            lastActivity: new Date(),
            participants: {
              create: participants,
            },
          },
          include: {
            messages: {
              orderBy: {
                timestamp: "asc",
              },
            },
            participants: true,
          },
        });
        return newChat;
      });

      // ...

      // Create chat with transaction for atomicity
      chat = await prisma.$transaction(async (tx: any) => {
        return await tx.projectChat.create({
          data: {
            projectId,
            lastActivity: new Date(),
            participants: {
              create: participants,
            },
          },
        });
      });
    }

    return NextResponse.json(chat, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("GET /api/project-chat/[projectId] error:", error);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// POST /api/project-chat/{projectId} - Post a new message to a project chat
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const { content, replyToMessageId } = await req.json();

    if (!content || content.trim() === '') {
      return new NextResponse("Message content cannot be empty", { status: 400, headers: corsHeaders });
    }

    let chat = await prisma.projectChat.findFirst({
      where: { projectId },
    });

    if (!chat) {
      return new NextResponse("Chat not found", { status: 404, headers: corsHeaders });
    }

    const senderName = session.user.name || session.user.email || 'User';
    const senderRole = session.user.role ?? "User";

    const newMessage = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: session.user.id,
        senderName,
        senderRole,
        content,
        ...(replyToMessageId && { replyToMessageId }),
      },
    });

    return NextResponse.json(newMessage, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error("POST /api/project-chat/[projectId] error:", error);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}