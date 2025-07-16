import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { DeveloperProfile, DeveloperProfileDataContent } from "@/lib/types";
import { getSession } from "@/lib/getSession";

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// GET /api/project-chat/{projectId} - Get chat messages for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Validate ObjectId format
    if (!isValidObjectId(projectId)) {
      console.error(`GET /api/project-chat/[projectId] - Invalid ObjectId format: ${projectId}`);
      return new NextResponse("Invalid project ID format", { status: 400, headers: corsHeaders });
    }
    
    // Add authentication check
    const session = await getSession(req);
    if (!session || !session.user) {
      console.error(`GET /api/project-chat/[projectId] - Unauthorized access attempt for project ${projectId}`);
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }
    
    console.log(`GET /api/project-chat/[projectId] - User ${session.user.id} (${session.user.role}) accessing project ${projectId}`);
    
    // For admin users, allow access to any project chat (even if project doesn't exist)
    if (session.user.role === "admin") {
      console.log(`GET /api/project-chat/[projectId] - Admin access granted for project ${projectId}`);
      
      // Try to find existing chat first
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
      
      // If no chat exists, create one with admin as the only participant
      if (!chat) {
        console.log(`GET /api/project-chat/[projectId] - Creating admin-only chat for project ${projectId}`);
        
        chat = await prisma.projectChat.create({
          data: {
            projectId,
            lastActivity: new Date(),
            participants: {
              create: [{
                userId: session.user.id,
                name: session.user.name ?? "Admin",
                role: "admin",
                isOnline: false,
              }],
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
        
        console.log(`GET /api/project-chat/[projectId] - Created admin-only chat`);
      }
      
      return NextResponse.json(chat, { status: 200, headers: corsHeaders });
    }
    
    // For non-admin users, verify project exists and check access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: {
          include: {
            developer: true,
          },
        },
      },
    });

    if (!project) {
      console.error(`GET /api/project-chat/[projectId] - Project not found: ${projectId}`);
      return new NextResponse("Project not found", { status: 404, headers: corsHeaders });
    }

    // Check if user has access to this project
    const hasAccess = 
      project.clientId === session.user.id || // Client can access their projects
      project.assignments.some(assignment => 
        assignment.developer?.userId === session.user.id // Developer can access assigned projects
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
      
      const participants = [];
      
      // Add client as participant if clientId exists
      if (project.clientId) {
        const clientUser = await prisma.user.findUnique({
          where: { id: project.clientId },
          select: { id: true, firstName: true, lastName: true },
        });
        if (clientUser) {
          participants.push({
            userId: clientUser.id,
            name: `${clientUser.firstName} ${clientUser.lastName}`.trim() || "Client",
            role: "client",
            isOnline: false,
          });
        }
      }
      
      // Add developers as participants
      project.assignments.forEach((assignment) => {
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
      
      // Add admin user if they're the one accessing
      if (session.user.role === "admin" && !participants.some(p => p.userId === session.user.id)) {
        participants.push({
          userId: session.user.id,
          name: session.user.name ?? "Admin",
          role: "admin",
          isOnline: false,
        });
      }
      
      // Create the chat
      chat = await prisma.projectChat.create({
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
      
      console.log(`GET /api/project-chat/[projectId] - Created new chat with ${participants.length} participants`);
    }

    return NextResponse.json(chat, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("GET /api/project-chat/[projectId] - Detailed error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      projectId: (await params).projectId,
      timestamp: new Date().toISOString()
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid ID')) {
        return new NextResponse("Invalid project ID format", { status: 400, headers: corsHeaders });
      }
      if (error.message.includes('Project not found')) {
        return new NextResponse("Project not found", { status: 404, headers: corsHeaders });
      }
    }
    
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
    
    // Validate ObjectId format
    if (!isValidObjectId(projectId)) {
      console.error(`POST /api/project-chat/[projectId] - Invalid ObjectId format: ${projectId}`);
      return new NextResponse("Invalid project ID format", { status: 400, headers: corsHeaders });
    }
    
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const { content, replyToMessageId } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400, headers: corsHeaders });
    }
    
    console.log(`POST /api/project-chat/[projectId] - User ${session.user.id} (${session.user.role}) sending message to project ${projectId}`);
    
    // For admin users, allow posting to any project chat (even if project doesn't exist)
    if (session.user.role === "admin") {
      console.log(`POST /api/project-chat/[projectId] - Admin access granted for posting to project ${projectId}`);
    } else {
      // For non-admin users, verify project exists and check access
      const projectCheck = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          assignments: {
            include: {
              developer: true,
            },
          },
        },
      });

      if (!projectCheck) {
        return new NextResponse("Project not found", { status: 404, headers: corsHeaders });
      }

      // Check if user has access to this project
      const hasAccess = 
        projectCheck.clientId === session.user.id || // Client can access their projects
        projectCheck.assignments.some(assignment => 
          assignment.developer?.userId === session.user.id // Developer can access assigned projects
        );

      if (!hasAccess) {
        return new NextResponse("Access denied", { status: 403, headers: corsHeaders });
      }
    }

    // Find the chat container for the project, or create it if it doesn't exist.
    // This uses findFirst and create to avoid a race condition if multiple users post at once.
    let chat = await prisma.projectChat.findFirst({
        where: { projectId },
    });

    if (!chat) {
      const participants = [];
      
      // Try to get project data if it exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          assignments: {
            include: {
              developer: true,
            },
          },
        },
      });

      if (project) {
        // Add client as participant if clientId exists
        if (project.clientId) {
          const clientUser = await prisma.user.findUnique({
            where: { id: project.clientId },
            select: { id: true, firstName: true, lastName: true },
          });
          if (clientUser) {
            participants.push({
              userId: clientUser.id,
              name: `${clientUser.firstName} ${clientUser.lastName}`.trim() || "Client",
              role: "client",
              isOnline: false,
            });
          }
        }

        // Add developers as participants
        project.assignments.forEach((assignment) => {
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
      } else if (session.user.role !== "admin") {
        // If project doesn't exist and user is not admin, return 404
        return new NextResponse("Project not found", { status: 404, headers: corsHeaders });
      }

      // Always add the current user as a participant if they're not already included
      if (!participants.some(p => p.userId === session.user.id)) {
        participants.push({
          userId: session.user.id,
          name: session.user.name ?? (session.user.role === "admin" ? "Admin" : "User"),
          role: session.user.role,
          isOnline: false,
        });
      }

      chat = await prisma.projectChat.create({
        data: {
          projectId,
          lastActivity: new Date(),
          participants: {
            create: participants,
          },
        },
      });
      
      console.log(`POST /api/project-chat/[projectId] - Created chat with ${participants.length} participants`);
    } else {
        await prisma.projectChat.update({
            where: { id: chat.id },
            data: { lastActivity: new Date() },
        });
    }

    // The ChatMessage schema requires senderName and senderRole.
    // We'll construct the name from the session. This assumes the session user has these fields.
    const senderName = session.user.name ?? "Unknown User";
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
    console.error("POST /api/project-chat/[projectId] - Detailed error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      projectId: (await params).projectId,
      timestamp: new Date().toISOString()
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid ID')) {
        return new NextResponse("Invalid project ID format", { status: 400, headers: corsHeaders });
      }
      if (error.message.includes('Project not found')) {
        return new NextResponse("Project not found", { status: 404, headers: corsHeaders });
      }
    }
    
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
