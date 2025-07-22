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

    // Get existing chat for this project
    let projectChat = await prisma.projectChat.findUnique({
      where: { projectId },
    });

    // Create chat if it doesn't exist
    if (!projectChat) {
      console.log(`Creating new chat for project ${projectId}`);
      
      // Build initial participants list
      const participants: any[] = [];

      // Add client if exists
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

      // Add all admins
      const adminUsers = await prisma.user.findMany({
        where: { role: "admin" },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      });

      for (const admin of adminUsers) {
        participants.push({
          userId: admin.id,
          name: `${admin.firstName} ${admin.lastName}`.trim() || admin.email || "Admin",
          role: "admin",
          isOnline: false,
        });
      }

      // Add existing assigned developers
      for (const assignment of project.assignments) {
        if (assignment.developer && assignment.developer.userId) {
          const developerUser = await getUserDetails(assignment.developer.userId);
          if (developerUser) {
            const developerData = assignment.developer.data as any;
            const developerName = developerData?.personalInfo?.firstName && developerData?.personalInfo?.lastName
              ? `${developerData.personalInfo.firstName} ${developerData.personalInfo.lastName}`
              : `${developerUser.firstName} ${developerUser.lastName}`.trim() || developerUser.email || "Developer";

            participants.push({
              userId: developerUser.id,
              name: developerName,
              role: "developer",
              isOnline: false,
            });
          }
        }
      }

      // Create the chat
      projectChat = await prisma.projectChat.create({
        data: {
          projectId,
          participants,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log(`Created chat for project ${projectId} with ${participants.length} participants`);
    }

    // Add new developers to existing chat
    const existingParticipants = (projectChat.participants as any[]) || [];
    const existingUserIds = new Set(existingParticipants.map(p => p.userId));
    const newParticipants = [...existingParticipants];

    for (const developerId of developerIds) {
      // Find the developer profile
      const developerProfile = await prisma.developerProfile.findUnique({
        where: { id: developerId },
      });

      if (developerProfile && developerProfile.userId && !existingUserIds.has(developerProfile.userId)) {
        const developerUser = await getUserDetails(developerProfile.userId);
        if (developerUser) {
          const developerData = developerProfile.data as any;
          const developerName = developerData?.personalInfo?.firstName && developerData?.personalInfo?.lastName
            ? `${developerData.personalInfo.firstName} ${developerData.personalInfo.lastName}`
            : `${developerUser.firstName} ${developerUser.lastName}`.trim() || developerUser.email || "Developer";

          newParticipants.push({
            userId: developerUser.id,
            name: developerName,
            role: "developer",
            isOnline: false,
          });

          existingUserIds.add(developerUser.id);
          console.log(`Added developer ${developerName} to chat participants`);
        }
      }
    }

    // Update the chat with new participants
    await prisma.projectChat.update({
      where: { id: projectChat.id },
      data: {
        participants: newParticipants,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully updated chat participants`,
        data: {
          projectId,
          participantCount: newParticipants.length,
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
