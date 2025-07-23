import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";

// Get assignments for a specific developer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;

    // Validate developerId parameter
    if (!developerId || typeof developerId !== 'string') {
      return NextResponse.json(
        { success: false, error: "Invalid developer ID" },
        { status: 400 }
      );
    }

    // Get session for authentication
    const session = await getSession(req);
    if (!session?.user) {
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
        project: {
          select: {
            id: true,
            projectDetails: true,
            userInfo: true,
            status: true,
            priority: true,
            techStack: true,
            createdAt: true,
            updatedAt: true,
            estimatedCompletionDate: true,
            progress: true,
            milestones: true,
            timeline: true,
          }
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    // Transform assignments to include developer-relevant information only
    const transformedAssignments = assignments.map((assignment) => {
      const project = assignment.project;
      const projectDetails = project.projectDetails as any;
      const userInfo = project.userInfo as any;
      
      return {
        id: assignment.id,
        assignedAt: assignment.assignedAt,
        status: assignment.status,
        role: assignment.role,
        project: {
          id: project.id,
          title: projectDetails?.title ?? "Untitled Project",
          description: projectDetails?.description ?? "",
          status: project.status,
          priority: project.priority,
          category: projectDetails?.category ?? "",
          techStack: project.techStack || [],
          startDate: project.createdAt,
          estimatedCompletionDate: project.estimatedCompletionDate,
          progress: project.progress ?? 0,
          clientName: userInfo?.company ?? userInfo?.name ?? "Client",
          milestones: project.milestones || [],
          requirements: projectDetails?.requirements || [],
          timeline: project.timeline || [],
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
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;

    // Validate developerId parameter
    if (!developerId || typeof developerId !== 'string') {
      return NextResponse.json(
        { success: false, error: "Invalid developer ID" },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { assignmentId, status, actualHours, notes } = body;

    // Get session for authentication
    const session = await getSession(req);
    if (!session?.user) {
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
    if (!assignmentId || typeof assignmentId !== 'string') {
      return NextResponse.json(
        { success: false, error: "Valid assignment ID is required" },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses = ['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Validate actualHours if provided
    if (actualHours !== undefined && (typeof actualHours !== 'number' || actualHours < 0)) {
      return NextResponse.json(
        { success: false, error: "Actual hours must be a non-negative number" },
        { status: 400 }
      );
    }

    // Check if assignment exists and belongs to the developer
    const existingAssignment = await prisma.projectAssignment.findFirst({
      where: {
        id: assignmentId,
        developerId: developerId,
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (actualHours !== undefined) updateData.actualHours = actualHours;
    if (notes !== undefined) updateData.notes = notes;

    // Update the assignment
    const updatedAssignment = await prisma.projectAssignment.update({
      where: {
        id: assignmentId,
      },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            projectDetails: true,
            userInfo: true,
            status: true,
            priority: true,
            techStack: true,
            createdAt: true,
            updatedAt: true,
            estimatedCompletionDate: true,
            progress: true,
            milestones: true,
            timeline: true,
          }
        },
      },
    });

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      message: "Assignment updated successfully",
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    
    // Handle Prisma specific errors
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { success: false, error: "Assignment not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}