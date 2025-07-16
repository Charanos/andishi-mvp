import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/project-assignments/[projectId] - Get assignments for a specific project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId },
      include: {
        developer: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// POST /api/project-assignments/[projectId] - Create a new assignment for a project
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { developerId, role = "Developer", status = "pending" } = body;

    if (!developerId) {
      return NextResponse.json({ error: 'Developer ID is required' }, { status: 400 });
    }

    const existingAssignment = await prisma.projectAssignment.findUnique({
      where: {
        projectId_developerId: {
          projectId,
          developerId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json({ error: 'This developer is already assigned to this project' }, { status: 409 });
    }

    // Create the assignment
    const newAssignment = await prisma.projectAssignment.create({
      data: {
        projectId,
        developerId,
        role,
        status,
      },
    });

    // Update developer availability and clear any busyUntilDate
    await prisma.developerProfile.update({
      where: { id: developerId },
      data: { 
        isAvailable: false,
        busyUntilDate: null // Clear any existing busyUntilDate when assigning to new project
      },
    });

    

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003' || error.code === 'P2025') {
        return NextResponse.json({ error: 'Invalid projectId or developerId' }, { status: 404 });
      }
    }
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


// PATCH /api/project-assignments/[projectId] - Update an assignment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { developerId, updates } = body;

    if (!developerId || !updates) {
      return NextResponse.json({ error: 'Developer ID and updates object are required' }, { status: 400 });
    }

    const updatedAssignment = await prisma.projectAssignment.update({
      where: {
        projectId_developerId: {
          projectId,
          developerId,
        },
      },
      data: updates,
    });

    // If assignment is completed, check if developer should be made available
    if (updates.status === 'completed') {
      
      
      const otherActiveAssignments = await prisma.projectAssignment.count({
        where: {
          developerId,
          status: { notIn: ['completed', 'cancelled'] },
          id: { not: updatedAssignment.id } // Exclude the current assignment
        }
      });

      

      if (otherActiveAssignments === 0) {
        // Get project info for busyUntilDate logic
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { estimatedCompletionDate: true }
        });

        const now = new Date();
        let updateData: any = {};

        if (project?.estimatedCompletionDate && project.estimatedCompletionDate > now) {
          // Project completed before estimated completion date
          updateData = {
            isAvailable: false,
            busyUntilDate: project.estimatedCompletionDate,
          };
          
        } else {
          // Project completed on or after estimated completion date
          updateData = {
            isAvailable: true,
            busyUntilDate: null,
          };
          
        }

        await prisma.developerProfile.update({
          where: { id: developerId },
          data: updateData,
        });
        
        // Update user status accordingly
        const developerProfile = await prisma.developerProfile.findUnique({
          where: { id: developerId },
          select: { userId: true },
        });
        
        if (developerProfile?.userId) {
          await prisma.user.update({
            where: { id: developerProfile.userId },
            data: { status: updateData.isAvailable ? "active" : "busy" },
          });
        }
      } else {
        
      }
    }

    return NextResponse.json(updatedAssignment, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/project-assignments/[projectId] - Remove an assignment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const { developerId } = await req.json();

    if (!developerId) {
      return NextResponse.json({ error: 'Developer ID is required in the request body' }, { status: 400 });
    }

    await prisma.projectAssignment.delete({
      where: {
        projectId_developerId: {
          projectId,
          developerId,
        },
      },
    });

    const otherAssignments = await prisma.projectAssignment.count({
      where: {
        developerId,
        status: { not: 'completed' }
      }
    });

    if (otherAssignments === 0) {
      // Update developer profile to available
      await prisma.developerProfile.update({
        where: { id: developerId },
        data: { isAvailable: true },
      });
      
      // Update user status to active
      const developerProfile = await prisma.developerProfile.findUnique({
        where: { id: developerId },
        select: { userId: true },
      });
      
      if (developerProfile?.userId) {
        await prisma.user.update({
          where: { id: developerProfile.userId },
          data: { status: "active" },
        });
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}