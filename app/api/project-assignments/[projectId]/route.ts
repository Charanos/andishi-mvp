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
    console.error(`GET /api/project-assignments/${projectId}`, error);
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

    const newAssignment = await prisma.projectAssignment.create({
      data: {
        projectId,
        developerId,
        role,
        status,
      },
    });

    await prisma.developerProfile.update({
      where: { id: developerId },
      data: { isAvailable: false },
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003' || error.code === 'P2025') {
        return NextResponse.json({ error: 'Invalid projectId or developerId' }, { status: 404 });
      }
    }
    console.error(`POST /api/project-assignments/${projectId}`, error);
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
          status: { not: 'completed' },
          id: { not: updatedAssignment.id } // Exclude the current assignment
        }
      });

      if (otherActiveAssignments === 0) {
        await prisma.developerProfile.update({
          where: { id: developerId },
          data: { isAvailable: true },
        });
      }
    }

    return NextResponse.json(updatedAssignment, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    console.error(`PATCH /api/project-assignments/${projectId}`, error);
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
      await prisma.developerProfile.update({
        where: { id: developerId },
        data: { isAvailable: true },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    console.error(`DELETE /api/project-assignments/${projectId}`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}