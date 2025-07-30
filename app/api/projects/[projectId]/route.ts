import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Helper function to update developer availability after project completion/deletion
async function updateDeveloperAvailability(
  developerId: string,
  projectEstimatedCompletionDate?: Date
) {
  try {
    // Check if developer has any other active assignments
    const otherActiveAssignments = await prisma.projectAssignment.count({
      where: {
        developerId,
        status: { notIn: ["completed", "cancelled"] },
      },
    });

    const now = new Date();
    let updateData: any = {};

    if (otherActiveAssignments === 0) {
      // No other active assignments
      if (projectEstimatedCompletionDate && projectEstimatedCompletionDate > now) {
        // Project completed/deleted before estimated completion date
        updateData = {
          isAvailable: false,
          busyUntilDate: projectEstimatedCompletionDate,
        };
      } else {
        // Project completed/deleted on or after estimated completion date
        updateData = {
          isAvailable: true,
          busyUntilDate: null,
        };
      }
    } else {
      // Developer has other active assignments, keep them busy
      updateData = {
        isAvailable: false,
        busyUntilDate: null,
      };
    }

    await prisma.developerProfile.update({
      where: { id: developerId },
      data: updateData,
    });

    return true;
  } catch (error) {
    console.error(`Error updating developer availability for ${developerId}:`, error);
    return false;
  }
}

// Helper function to handle project completion
async function handleProjectCompletion(projectId: string) {
  try {
    // Get the project with its estimated completion date
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { estimatedCompletionDate: true },
    });

    if (!project) {
      console.error(`Project ${projectId} not found`);
      return false;
    }

    // Get all assignments for this project
    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId },
      select: { developerId: true },
    });

    // Update each assigned developer's availability
    const updatePromises = assignments.map(assignment =>
      updateDeveloperAvailability(assignment.developerId, project.estimatedCompletionDate || undefined)
    );

    await Promise.all(updatePromises);

    // Mark all assignments as completed
    await prisma.projectAssignment.updateMany({
      where: { projectId },
      data: { status: "completed" },
    });

    return true;
  } catch (error) {
    console.error(`Error handling project completion for ${projectId}:`, error);
    return false;
  }
}

// Helper function to handle project deletion
async function handleProjectDeletion(projectId: string) {
  try {
    // Get the project with its estimated completion date
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { estimatedCompletionDate: true },
    });

    if (!project) {
      console.error(`Project ${projectId} not found`);
      return false;
    }

    // Get all assignments for this project
    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId },
      select: { developerId: true },
    });

    // Update each assigned developer's availability
    const updatePromises = assignments.map(assignment =>
      updateDeveloperAvailability(assignment.developerId, project.estimatedCompletionDate || undefined)
    );

    await Promise.all(updatePromises);

    return true;
  } catch (error) {
    console.error(`Error handling project deletion for ${projectId}:`, error);
    return false;
  }
}

// GET /api/projects/[projectId] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        assignments: {
          include: {
            developer: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch client information if clientId exists
    let clientInfo = {};
    if (project.clientId) {
      const clientUser = await prisma.user.findUnique({
        where: { id: project.clientId },
        select: { id: true, firstName: true, lastName: true, email: true, company: true }
      });
      
      if (clientUser) {
        clientInfo = {
          id: clientUser.id,
          firstName: clientUser.firstName,
          lastName: clientUser.lastName,
          email: clientUser.email,
          company: clientUser.company,
        };
      }
    }

    // Merge client info into project userInfo
    // Ensure we're working with a valid object
    const projectWithClientInfo = Object.assign({}, project, {
      userInfo: Object.assign({}, project.userInfo || {}, clientInfo)
    });

    return NextResponse.json(projectWithClientInfo, { status: 200 });
  } catch (error) {
    const { projectId } = await params;
    console.error(`GET /api/projects/${projectId}`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT/PATCH /api/projects/[projectId] - Update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const { status, ...updateData } = body;

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...updateData,
        ...(status && { status }),
      },
    });

    // Handle automatic developer unassignment if project is completed
    if (status === "completed") {
      const success = await handleProjectCompletion(projectId);
      if (!success) {
        console.warn(`Failed to properly handle developer unassignment for completed project ${projectId}`);
      }
    }

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const { projectId } = await params;
    console.error(`PUT /api/projects/${projectId}`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/projects/[projectId] - Update a project (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return PUT(request, { params });
}

// DELETE /api/projects/[projectId] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Handle developer unassignment before deleting the project
    const success = await handleProjectDeletion(projectId);
    if (!success) {
      console.warn(`Failed to properly handle developer unassignment for deleted project ${projectId}`);
    }

    // Delete the project (this will cascade delete assignments due to onDelete: Cascade)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const { projectId } = await params;
    console.error(`DELETE /api/projects/${projectId}`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
