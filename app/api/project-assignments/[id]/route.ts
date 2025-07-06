import { NextRequest, NextResponse } from "next/server";
import { mockAssignments } from "@/lib/mockData";

// GET /api/project-assignments/[id] - Get specific assignment
export async function GET(_req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    const assignment = mockAssignments.getById(params.id);
    
    if (!assignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }
    
    return NextResponse.json(assignment, { status: 200 });
  } catch (error) {
    console.error("GET /api/project-assignments/[id]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/project-assignments/[id] - Update assignment status
export async function PUT(req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    const { status, role } = await req.json();
    
    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }
    
    const validStatuses = ["pending", "accepted", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }
    
    const updatedAssignment = mockAssignments.update(params.id, {
      status,
      ...(role && { role }),
    });
    
    if (!updatedAssignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }
    
    return NextResponse.json(updatedAssignment, { status: 200 });
  } catch (error) {
    console.error("PUT /api/project-assignments/[id]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/project-assignments/[id] - Remove assignment
export async function DELETE(_req: NextRequest, context: { params: any }) {
  try {
    const params = await context.params;
    const deleted = mockAssignments.delete(params.id);
    
    if (!deleted) {
      return new NextResponse("Assignment not found", { status: 404 });
    }
    
    return new NextResponse("Assignment deleted", { status: 200 });
  } catch (error) {
    console.error("DELETE /api/project-assignments/[id]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
