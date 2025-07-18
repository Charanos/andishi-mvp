import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { getProjectDetails, createChatParticipants } from "../[projectId]/route";

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://andishi.dev' : '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// POST /api/project-chat/test - Test project chat access for a specific project
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const { projectId } = await req.json();
    if (!projectId) {
      return new NextResponse("Project ID is required", { status: 400, headers: corsHeaders });
    }

    console.log(`Testing project chat access for project: ${projectId}, user: ${session.user.id} (${session.user.role})`);

    // Get project details
    const project = await getProjectDetails(projectId);
    if (!project) {
      return NextResponse.json({
        success: false,
        message: "Project not found",
        projectId
      }, { status: 404, headers: corsHeaders });
    }

    // Check access
    const hasAccess = 
      session.user.role === "admin" || 
      project.clientId === session.user.id || 
      project.assignments.some(assignment => 
        assignment.developer?.userId === session.user.id && 
        ['pending', 'accepted'].includes(assignment.status)
      );

    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: "Access denied",
        projectId,
        userRole: session.user.role,
        clientId: project.clientId,
        assignments: project.assignments.map(a => ({
          developerId: a.developer?.userId,
          status: a.status
        }))
      }, { status: 403, headers: corsHeaders });
    }

    // Get expected participants
    const expectedParticipants = await createChatParticipants(project);

    return NextResponse.json({
      success: true,
      message: "Access granted",
      projectId,
      userRole: session.user.role,
      project: {
        id: project.id,
        title: (project.projectDetails as any)?.title || 'Untitled Project',
        clientId: project.clientId,
        assignments: project.assignments.map(a => ({
          developerId: a.developer?.userId,
          status: a.status
        }))
      },
      expectedParticipants
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Error testing project chat:', error);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
