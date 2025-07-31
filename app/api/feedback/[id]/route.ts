import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

// PUT /api/feedback/[id] - Update feedback (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getSession(request);

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Await the params Promise
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing feedback ID" }, 
        { status: 400 }
      );
    }

    const body = await request.json();
    const { read } = body;

    // Validate that at least one field is being updated
    if (read === undefined) {
      return NextResponse.json(
        { error: "No fields to update" }, 
        { status: 400 }
      );
    }

    // Check if feedback exists
    const existingFeedback = await prisma.contactFeedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { error: "Feedback not found" }, 
        { status: 404 }
      );
    }

    const updatedFeedback = await prisma.contactFeedback.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json(updatedFeedback, { status: 200 });
  } catch (error) {
    console.error(`[Feedback API] PUT /api/feedback/[id]`, error);
    
    // Handle Prisma record not found error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: "Feedback not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

// DELETE /api/feedback/[id] - Delete feedback (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await getSession(request);

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Await the params Promise
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing feedback ID" }, 
        { status: 400 }
      );
    }

    // Check if feedback exists
    const existingFeedback = await prisma.contactFeedback.findUnique({
      where: { id },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { error: "Feedback not found" }, 
        { status: 404 }
      );
    }

    // Soft delete by marking as deleted
    const deletedFeedback = await prisma.contactFeedback.update({
      where: { id },
      data: { deleted: true },
    });

    return NextResponse.json(deletedFeedback, { status: 200 });
  } catch (error) {
    console.error(`[Feedback API] DELETE /api/feedback/[id]`, error);
    
    // Handle Prisma record not found error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: "Feedback not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}