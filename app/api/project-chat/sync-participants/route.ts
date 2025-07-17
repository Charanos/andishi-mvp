import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { createChatParticipants, getProjectDetails, getUserDetails } from "../[projectId]/route";

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://andishi.dev' : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// POST /api/project-chat/sync-participants - Sync participants for all project chats
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // Only allow admin to run this sync
    if (session.user.role !== 'admin') {
      return new NextResponse("Access denied", { status: 403, headers: corsHeaders });
    }

    console.log('Starting participant sync process...');

    const allChats = await prisma.projectChat.findMany({
      include: { participants: true },
    });

    let updatedChats = 0;
    for (const chat of allChats) {
      try {
        const project = await getProjectDetails(chat.projectId);
        if (!project) {
          console.warn(`Skipping chat for non-existent project: ${chat.projectId}`);
          continue;
        }

        const expectedParticipants = await createChatParticipants(project);
        const currentParticipants = chat.participants;

        // Compare and update if needed
        const needsUpdate = 
          expectedParticipants.length !== currentParticipants.length ||
          !expectedParticipants.every(expected => 
            currentParticipants.some(current => current.userId === expected.userId)
          );

        if (needsUpdate) {
          await prisma.projectChat.update({
            where: { id: chat.id },
            data: {
              participants: {
                deleteMany: {},
                create: expectedParticipants,
              },
            },
          });
          updatedChats++;
          console.log(`Synced participants for project: ${chat.projectId}`);
        }
      } catch (error) {
        console.error(`Failed to sync participants for project ${chat.projectId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync complete. ${updatedChats} chats updated.`,
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Error syncing participants:', error);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

