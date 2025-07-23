import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";

// Get assignments for a specific developer
export async function GET(
  req: NextRequest,
  { params }: { params: { developerId: string } }
) {
  try {
    const { developerId } = await params;

    // Get session for authentication
    const session = await getSession(req);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the developer is requesting their own assignments or admin is requesting
    if (session.user.role !== "admin" && session.user.id !== developerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Fetch assignments for the developer
    const assignments = await prisma.projectAssignment.findMany({
      where: {
        developerId: developerId,
      },
      include: {
        project: true,
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    // Transform assignments to include developer-relevant information only
    const transformedAssignments = assignments.map((assignment) => {
      const project = assignment.project;
      return {
        id: assignment.id,
        assignedAt: assignment.assignedAt,
        status: assignment.status,
        role: assignment.role,
        project: {
          id: project.id,
          title: (project.projectDetails as any)?.title ?? "Untitled Project",
          description: (project.projectDetails as any)?.description ?? "",
          status: project.status,
          priority: project.priority,
          category: (project.projectDetails as any)?.category ?? "",
          techStack: project.techStack,
          startDate: project.createdAt,
          estimatedCompletionDate: project.estimatedCompletionDate,
          progress: project.progress,
          // No budget exposed
          clientName: (project.userInfo as any)?.company ?? "Client",
          milestones: project.milestones,
          requirements: (project.projectDetails as any)?.requirements,
          timeline: project.timeline,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      };
    });

    return NextResponse.json({
      success: true,
      assignments: transformedAssignments,
      count: transformedAssignments.length,
    });
  } catch (error) {
    console.error("Error fetching developer assignments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// Update assignment status (developer can update their own assignment status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { developerId: string } }
) {
  try {
    const { developerId } = await params;
    const body = await req.json();
    const { assignmentId, status, actualHours, notes } = body;

    // Get session for authentication
    const session = await getSession(req);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the developer is updating their own assignment
    if (session.user.id !== developerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Update the assignment
    const updatedAssignment = await prisma.projectAssignment.update({
      where: {
        id: assignmentId,
        developerId: developerId, // Ensure developer can only update their own assignments
      },
      data: {
        ...(status && { status }),
        updatedAt: new Date(),
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      message: "Assignment updated successfully",
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}
