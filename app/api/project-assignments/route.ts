import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// GET /api/project-assignments - Get all project assignments
export async function GET() {
  try {
    const assignments = await prisma.projectAssignment.findMany({
      include: {
        project: true,
        developer: {
          include: {
            user: true,
          },
        },
      },
    });
    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error("GET /api/project-assignments", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/project-assignments - Create new project assignments for multiple developers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, developerIds: rawDeveloperIds, role = "Developer" } = body;
    // Sanitize developerIds: remove null/undefined/empty strings and deduplicate
    const developerIds: string[] = Array.from(
      new Set(
        (rawDeveloperIds as any[]).map((d) => {
          if (typeof d === 'string') return d.trim();
          if (d && typeof d === 'object') {
            return (
              d._id ?? d.id ?? d.value ?? (typeof d.toString === 'function' ? d.toString() : '')
            ).toString();
          }
          return String(d);
        }).filter((id: string) => id)
      )
    );

    if (!projectId || developerIds.length === 0) {
      return new NextResponse("Project ID and a non-empty array of developer IDs are required", { status: 400 });
    }

    const assignmentsToCreate = developerIds.map((developerId: string) => ({
      projectId,
      developerId,
      role,
      status: "pending",
    }));

    // Use a transaction to ensure all or nothing is created
    const createdAssignments = await prisma.$transaction(async (tx: any ) => {
      // Find existing assignments to prevent duplicates
      const existingAssignments = await tx.projectAssignment.findMany({
        where: {
          projectId,
          developerId: { in: developerIds },
        },
        select: {
          developerId: true,
        },
      });

      const existingDeveloperIds = new Set(existingAssignments.map((a: { developerId: string }) => a.developerId));

      const assignmentsToActuallyCreate = assignmentsToCreate.filter(
        (assignment) => !existingDeveloperIds.has(assignment.developerId)
      );

      if (assignmentsToActuallyCreate.length > 0) {
        await tx.projectAssignment.createMany({
          data: assignmentsToActuallyCreate,
        });

        // Determine busy-until date from project estimated completion
        const project = await tx.project.findUnique({
          where: { id: projectId },
          select: { estimatedCompletionDate: true, timeline: true },
        });

        let busyUntil: Date | undefined = project?.estimatedCompletionDate;
        // fallback: if project timeline is an object with endDate or number of days
        if (!busyUntil && (project as any)?.timeline?.endDate) {
          busyUntil = new Date((project as any).timeline.endDate);
        }

        await tx.developerProfile.updateMany({
          where: {
            id: { in: assignmentsToActuallyCreate.map(a => a.developerId) },
          },
          data: {
            isAvailable: false,
            busyUntil,
          },
        });
        
        // Update user status to busy for all assigned developers
        const developerProfiles = await tx.developerProfile.findMany({
          where: {
            id: { in: assignmentsToActuallyCreate.map(a => a.developerId) },
          },
          select: {
            id: true,
            userId: true,
          },
        });
        
        const userIds = developerProfiles
          .filter((profile: { userId: string }) => profile.userId)
          .map((profile: { userId: string }) => profile.userId!);
        
        if (userIds.length > 0) {
          await tx.user.updateMany({
            where: {
              id: { in: userIds },
            },
            data: {
              status: "busy",
            },
          });
        }
      }

      // Fetch the created assignments to return them (including any that already existed but were not re-created)
      return tx.projectAssignment.findMany({
        where: {
          projectId,
          developerId: { in: developerIds },
        },
      });
    });

    return NextResponse.json(createdAssignments, { status: 201 });

  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'One or more projectId or developerId is invalid' }, { status: 404 });
        }
    }
    console.error("POST /api/project-assignments", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}