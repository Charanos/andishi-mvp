import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserDetails } from "../route";

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://andishi.dev' : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// POST /api/project-chat/{projectId}/participants - Add developers to project chat
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { action, developerIds } = body;

    console.log(`Processing chat participant update for project ${projectId}:`, { action, developerIds });

    if (action !== "add_developers" || !Array.isArray(developerIds)) {
      return NextResponse.json(
        { success: false, message: "Invalid request format" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get project details to verify it exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: {
          where: {
            status: { in: ['pending', 'accepted'] }
          },
          include: {
            developer: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Step 1: Find the chat, or create it if it doesn't exist.
    let chat = await prisma.projectChat.findFirst({
      where: { projectId },
      include: { participants: true },
    });

    if (!chat) {
      console.log(`Creating new chat for project ${projectId}`);
      const initialParticipants: any[] = [];

      // Add client
      if (project.clientId) {
        const clientUser = await getUserDetails(project.clientId);
        if (clientUser) {
          initialParticipants.push({
            userId: clientUser.id,
            name: `${clientUser.firstName} ${clientUser.lastName}`.trim() || clientUser.email || "Client",
            role: "client",
          });
        }
      }

      // Add admins
      const adminUsers = await prisma.user.findMany({ where: { role: "admin" } });
      adminUsers.forEach(admin => initialParticipants.push({
        userId: admin.id,
        name: `${admin.firstName} ${admin.lastName}`.trim() || admin.email || "Admin",
        role: "admin",
      }));

      // Add existing assigned developers
      for (const assignment of project.assignments) {
        if (assignment.developer && assignment.developer.userId) {
          const devUser = await getUserDetails(assignment.developer.userId);
          if (devUser) {
            initialParticipants.push({
              userId: devUser.id,
              name: `${devUser.firstName} ${devUser.lastName}`.trim() || devUser.email || "Developer",
              role: "developer",
            });
          }
        }
      }

      chat = await prisma.projectChat.create({
        data: {
          projectId,
          lastActivity: new Date(),
          participants: { create: initialParticipants },
        },
        include: { participants: true },
      });
      console.log(`Created chat for project ${projectId} with ${initialParticipants.length} participants`);
    }

    // Step 2: Prepare the list of new developers to add.
    const existingUserIds = new Set((chat?.participants ?? []).map((p: any) => p.userId));
    const newParticipantData: any[] = [];

    for (const developerId of developerIds) {
      const developerProfile = await prisma.developerProfile.findUnique({ where: { id: developerId } });
      if (developerProfile?.userId && !existingUserIds.has(developerProfile.userId)) {
        const developerUser = await getUserDetails(developerProfile.userId);
        if (developerUser) {
          newParticipantData.push({
            chatId: chat.id, // Explicitly link to the chat
            userId: developerUser.id,
            name: `${developerUser.firstName} ${developerUser.lastName}`.trim() || developerUser.email || "Developer",
            role: "developer",
          });
          existingUserIds.add(developerUser.id); // Prevent duplicates in the same batch
        }
      }
    }

    // Step 3: Add the new developers to the chat if any exist.
    if (newParticipantData.length > 0) {
      await prisma.chatParticipant.createMany({
        data: newParticipantData,
      });
      console.log(`Added ${newParticipantData.length} new developers to chat for project ${projectId}`);
      // Update last activity timestamp
      await prisma.projectChat.update({
          where: { id: chat.id },
          data: { lastActivity: new Date() },
      });
    }

    const finalChat = await prisma.projectChat.findFirst({
        where: { id: chat.id },
        include: { participants: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully updated chat participants`,
        data: {
          projectId,
          participantCount: (finalChat?.participants ?? []).length,
          addedDevelopers: developerIds.length,
        },
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error updating chat participants:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
