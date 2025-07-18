import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// DELETE /api/project-assignments/[assignmentId] - Remove an assignment and update developer availability
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  const { assignmentId } = params;

  if (!assignmentId) {
    return NextResponse.json(
      { error: "Assignment ID is required" },
      { status: 400 }
    );
  }

  try {
    // Find the assignment first to fetch developerId & projectId
    const assignment = await prisma.projectAssignment.findUnique({
      where: { id: assignmentId },
      select: { developerId: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const { developerId } = assignment;

    // Delete the assignment record
    await prisma.projectAssignment.delete({ where: { id: assignmentId } });

    // Check if developer still has any active assignments
    const activeAssignmentsCount = await prisma.projectAssignment.count({
      where: {
        developerId,
        status: { notIn: ["completed", "cancelled"] },
      },
    });

    if (activeAssignmentsCount === 0) {
      // Mark developer as available again
      await prisma.developerProfile.update({
        where: { userId: developerId },
        data: {
          isAvailable: true,
          busyUntilDate: null,
        },
      });

      // Also update user status if desired
      await prisma.user.update({
        where: { id: developerId },
        data: { status: "active" },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[PROJECT_ASSIGNMENT_DELETE]", error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025" || error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid assignmentId" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
