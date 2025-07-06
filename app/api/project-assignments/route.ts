import { NextRequest, NextResponse } from "next/server";
import { mockAssignments } from "@/lib/mockData";

// GET /api/project-assignments - Get all project assignments
export async function GET() {
  try {
    // For now, return mock assignments
    // In production, this would query the database
    return NextResponse.json(mockAssignments.getAll(), { status: 200 });
  } catch (error) {
    console.error("GET /api/project-assignments", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/project-assignments - Create new project assignments
export async function POST(req: NextRequest) {
  try {
    const { projectId, developerIds, role = "Developer" } = await req.json();
    
    if (!projectId || !developerIds || !Array.isArray(developerIds)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create mock assignments for now
    const newAssignments = developerIds.map((developerId: string) => {
      // Check if assignment already exists
      if (mockAssignments.exists(projectId, developerId)) {
        return mockAssignments.findByProject(projectId).find(a => a.developerId === developerId);
      }
      
      return mockAssignments.create({
        projectId,
        developerId,
        role,
        status: "pending",
      });
    });

    // Update developer availability status
    // Note: In a real implementation, this would update the developer's availability in the database
    // For now, we'll just log the update since we're using mock data
    console.log(`Updated availability for developers: ${developerIds.join(", ")} - marked as unavailable`);

    return NextResponse.json(newAssignments, { status: 201 });
  } catch (error) {
    console.error("POST /api/project-assignments", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
