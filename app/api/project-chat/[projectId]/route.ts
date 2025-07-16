import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { DeveloperProfile, DeveloperProfileDataContent } from "@/lib/types";
import { getSession } from "@/lib/getSession";

// GET /api/project-chat/{projectId} - Get chat messages for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const chat = await prisma.projectChat.findFirst({
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

    if (!chat) {
      return NextResponse.json({ messages: [], participants: [] }, { status: 200 });
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("GET /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/project-chat/{projectId} - Post a new message to a project chat
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;
    const { content, replyToMessageId } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Find the chat container for the project, or create it if it doesn't exist.
    // This uses findFirst and create to avoid a race condition if multiple users post at once.
    let chat = await prisma.projectChat.findFirst({
        where: { projectId },
    });

    if (!chat) {
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
        return new NextResponse("Project not found", { status: 404 });
      }

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
            isOnline: false, // Default to false, will be updated by presence system
          });
        }
      }

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
            isOnline: false, // Default to false, will be updated by presence system
          });
        }
      });

      // Add the admin user who is sending the message
      if (session.user.role === "admin" && !participants.some(p => p.userId === session.user.id)) {
        participants.push({
            userId: session.user.id,
            name: session.user.name ?? "Admin",
            role: "admin",
            isOnline: false, // Default to false, will be updated by presence system
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

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}