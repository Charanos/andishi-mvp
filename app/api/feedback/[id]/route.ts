import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

// PUT /api/feedback/[id] - Update feedback (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req);

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = params.id;

    if (!id) {
      return new NextResponse("Missing feedback ID", { status: 400 });
    }

    const body = await req.json();
    const { read } = body;

    // Validate that at least one field is being updated
    if (read === undefined) {
      return new NextResponse("No fields to update", { status: 400 });
    }

    const updatedFeedback = await prisma.contactFeedback.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json(updatedFeedback, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/feedback/${params.id}`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/feedback/[id] - Delete feedback (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req);

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = params.id;

    if (!id) {
      return new NextResponse("Missing feedback ID", { status: 400 });
    }

    // Soft delete by marking as deleted
    const deletedFeedback = await prisma.contactFeedback.update({
      where: { id },
      data: { deleted: true },
    });

    return NextResponse.json(deletedFeedback, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/feedback/${params.id}`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
