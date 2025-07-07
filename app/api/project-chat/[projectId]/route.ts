import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

// Helper: Check if user is a chat participant
async function isParticipant(chatId: string, userId: string) {
  const participant = await prisma.chatParticipant.findFirst({
    where: { chatId, userId },
  });
  return !!participant;
}

// Utility: Ensure all required participants exist for a project chat
async function ensureCoreParticipants(chatId: string, projectId: string, sender: { id: string, name: string, role: string }) {
  // Add sender if missing (already handled)
  // Add admin and client if not present
  // Find project to get clientId
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;
  // Add client
  if (project.clientId) {
    const clientParticipant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId: project.clientId },
    });
    if (!clientParticipant) {
      await prisma.chatParticipant.create({
        data: {
          chatId,
          userId: project.clientId,
          name: "Client", // Optionally fetch real name
          role: "client",
          isOnline: false,
        },
      });
    }
  }
  // Add admin (assume one admin for now, or skip if not available)
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (admin) {
    const adminParticipant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId: admin.id },
    });
    if (!adminParticipant) {
      await prisma.chatParticipant.create({
        data: {
          chatId,
          userId: admin.id,
          name: admin.firstName || "Admin",
          role: "admin",
          isOnline: false,
        },
      });
    }
  }
}

// Utility: Create a system message in the chat
async function createSystemMessage(chatId: string, content: string) {
  await prisma.chatMessage.create({
    data: {
      chatId,
      senderId: "system",
      senderName: "System",
      senderRole: "system",
      content,
      timestamp: new Date(),
      isRead: true,
    },
  });
}

// Utility: System message for assignment/removal (to be called from assignment API)
// export async function createAssignmentSystemMessage(projectId: string, content: string) {
//   const chat = await prisma.projectChat.findFirst({ where: { projectId } });
//   if (!chat) return;
//   await prisma.chatMessage.create({
//     data: {
//       chatId: chat.id,
//       senderId: "system",
//       senderName: "System",
//       senderRole: "system",
//       content,
//       timestamp: new Date(),
//       isRead: true,
//     },
//   });
// }

// Utility: Real-time broadcast placeholder
function broadcastChatUpdate(projectId: string, type: "message" | "assignment" | "removal", payload: any) {
  // TODO: Implement with WebSocket/SSE
  // Example: wsServer.emit(`project-chat:${projectId}`, { type, payload });
}

// GET /api/project-chat/[projectId] - Get chat data for a project
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const session = await getSession(req);
    if (!projectId || !session?.user?.id) {
      return new NextResponse("Project ID and user ID required", { status: 400 });
    }
    const userId = session.user.id;
    const chat = await prisma.projectChat.findFirst({
      where: { projectId },
      include: {
        participants: true,
        messages: { orderBy: { timestamp: "asc" } },
      },
    });
    if (!chat) return new NextResponse("Chat not found", { status: 404 });
    if (!(await isParticipant(chat.id, userId))) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error("GET /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/project-chat/[projectId] - Send a new message
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const { senderId, senderName, senderRole, content } = await req.json();
    if (!projectId || !senderId || !senderName || !senderRole || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    // Find or create chat
    let chat = await prisma.projectChat.findFirst({ where: { projectId } });
    let isNewChat = false;
    if (!chat) {
      chat = await prisma.projectChat.create({
        data: {
          projectId,
          lastActivity: new Date(),
        },
      });
      isNewChat = true;
    }
    // At this point, chat is guaranteed to exist
    // Ensure sender is a participant
    let participant = await prisma.chatParticipant.findFirst({
      where: { chatId: chat.id, userId: senderId },
    });
    if (!participant) {
      participant = await prisma.chatParticipant.create({
        data: {
          chatId: chat.id,
          userId: senderId,
          name: senderName,
          role: senderRole,
          isOnline: true,
        },
      });
    }
    // Ensure core participants (admin, client) exist
    await ensureCoreParticipants(chat.id, projectId, { id: senderId, name: senderName, role: senderRole });
    // If chat was just created, add a system message
    if (isNewChat) {
      await createSystemMessage(chat.id, `Project chat started. Participants: ${senderName} (${senderRole})${projectId ? ", client, admin" : ""}`);
    }
    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId,
        senderName,
        senderRole,
        content,
        timestamp: new Date(),
      },
    });
    // Update lastActivity
    await prisma.projectChat.update({
      where: { id: chat.id },
      data: { lastActivity: new Date() },
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/project-chat/[projectId] - Mark messages as read
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const { userId, messageIds } = await req.json();
    if (!projectId || !userId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    const chat = await prisma.projectChat.findFirst({ where: { projectId } });
    if (!chat) return new NextResponse("Chat not found", { status: 404 });
    if (!(await isParticipant(chat.id, userId))) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    if (messageIds && Array.isArray(messageIds)) {
      await prisma.chatMessage.updateMany({
        where: { chatId: chat.id, id: { in: messageIds }, senderId: { not: userId } },
        data: { isRead: true },
      });
    } else {
      await prisma.chatMessage.updateMany({
        where: { chatId: chat.id, senderId: { not: userId } },
        data: { isRead: true },
      });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/project-chat/[projectId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

