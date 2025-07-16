import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

// PUT /api/project-chat/{projectId}/{messageId} - Update a message
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; messageId: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messageId } = await params;
    const { content } = await req.json();

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { content },
    });

    return NextResponse.json(updatedMessage, { status: 200 });
  } catch (error) {
    console.error("PUT /api/project-chat/[projectId]/[messageId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/project-chat/{projectId}/{messageId} - Delete a message
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; messageId: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messageId } = await params;

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.chatMessage.delete({
      where: { id: messageId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/project-chat/[projectId]/[messageId]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
