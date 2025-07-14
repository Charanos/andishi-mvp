import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
      },
    });

    // If a chat container doesn't exist, there are no messages.
    if (!chat) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(chat.messages, { status: 200 });
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
    const { content } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Find the chat container for the project, or create it if it doesn't exist.
    // This uses findFirst and create to avoid a race condition if multiple users post at once.
    let chat = await prisma.projectChat.findFirst({
        where: { projectId },
    });

    if (!chat) {
        // In a real-world scenario, you might want to add participants here as well.
        // The current schema has a ChatParticipant model that is not being used in this API.
        chat = await prisma.projectChat.create({
            data: {
                projectId,
                lastActivity: new Date(),
            }
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
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("POST /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}