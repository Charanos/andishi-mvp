import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { NextRequest, NextResponse } from "next/server";
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
    const session = await getSession(req);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { projectId, developerIds: rawDeveloperIds, role } = body;

    if (!projectId || !rawDeveloperIds || !Array.isArray(rawDeveloperIds)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Sanitize and deduplicate developer IDs
    const developerIds: string[] = Array.from(
      new Set(
        (rawDeveloperIds as any[])
          .map((d) => {
            if (typeof d === "string") return d.trim();
            if (d && typeof d === "object") {
              return (
                d._id ??
                d.id ??
                d.value ??
                (typeof d.toString === "function" ? d.toString() : "")
              ).toString();
            }
            return String(d);
          })
          .filter((id: string) => id)
      )
    );

    if (developerIds.length === 0) {
      return new NextResponse("No valid developer IDs provided", {
        status: 400,
      });
    }

    const createdAssignments = await prisma.$transaction(async (prisma) => {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { estimatedCompletionDate: true, timeline: true },
      });

      if (!project) {
        throw new Error(`Project with ID ${projectId} not found.`);
      }

      // Derive busyUntil date from project data (estimatedCompletionDate or timeline)
      let busyUntil: Date | null = null;

      if (project.estimatedCompletionDate) {
        busyUntil = new Date(project.estimatedCompletionDate);
      } else if (project.timeline) {
        /*
          The `timeline` field may be:
          1. A simple ISO date string representing the project end date.
          2. A JSON-encoded array of milestone dates (legacy format).
        */
        try {
          const parsed = JSON.parse(project.timeline as unknown as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            busyUntil = new Date(parsed[parsed.length - 1]);
          }
        } catch (_) {
          // Not JSON – treat as single date string
          busyUntil = new Date(project.timeline as unknown as string);
        }
      }

      // Validate the date before using it
      if (busyUntil && isNaN(busyUntil.getTime())) {
        console.warn(
          `Invalid busyUntil date for project ${projectId}. Falling back to null.`
        );
        busyUntil = null; // proceed without blocking the assignment
      }

      const newAssignments = [];
      for (const developerId of developerIds) {
        const assignment = await prisma.projectAssignment.create({
          data: {
            projectId,
            developerId,
            role: role || "Developer", // Default role if not provided
          },
        });

        // Mark developer as busy
        await prisma.developerProfile.update({
          where: { userId: developerId },
          data: {
            isAvailable: false,
            busyUntilDate: busyUntil,
          },
        });

        // Also update the user's general status if applicable
        await prisma.user.update({
          where: { id: developerId },
          data: { status: "busy" },
        });

        newAssignments.push(assignment);
      }

      return newAssignments;
    });

    return NextResponse.json(createdAssignments, { status: 201 });
  } catch (error) {
    console.error("[PROJECT_ASSIGNMENT_POST]", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json({ error: 'One or more projectId or developerId is invalid' }, { status: 404 });
      }
    }
    return new NextResponse(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}