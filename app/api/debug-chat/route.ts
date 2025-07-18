import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import prisma from '@/lib/prisma';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId } = body;
    
    console.log('=== DEBUG CHAT ENDPOINT ===');
    console.log('Project ID provided:', projectId);
    console.log('Is valid ObjectId:', isValidObjectId(projectId));
    
    // Check authentication
    const session = await getSession(req);
    console.log('Session:', session ? 'Found' : 'Not found');
    console.log('User:', session?.user);
    
    if (!session || !session.user) {
      const authHeader = req.headers.get('authorization');
      const cookieToken = req.cookies.get('auth_token')?.value;
      console.log('Auth header:', authHeader ? 'Present' : 'Missing');
      console.log('Cookie token:', cookieToken ? 'Present' : 'Missing');
      
      return NextResponse.json({ 
        error: 'Unauthorized', 
        authHeader: !!authHeader,
        cookieToken: !!cookieToken
      }, { status: 401 });
    }
    
    // Validate project ID
    if (!isValidObjectId(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }
    
    // Get project details using Prisma
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        clientId: true,
        projectDetails: true,
        assignments: {
          include: {
            developer: true
          }
        }
      }
    });
    console.log('Project found:', project ? 'Yes' : 'No');
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check access
    const hasAccess = 
      session.user.role === "admin" || 
      project.clientId === session.user.id ||
      project.assignments.some(assignment => 
        assignment.developerId === session.user.id && 
        ['pending', 'accepted'].includes(assignment.status)
      );
    
    console.log('User has access:', hasAccess);
    console.log('User role:', session.user.role);
    console.log('Project client ID:', project.clientId);
    console.log('User ID:', session.user.id);
    console.log('Active assignments:', project.assignments.length);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Get user details using Prisma
    const userDetails = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { developerProfile: true }
    });
    console.log('User details:', userDetails);
    
    return NextResponse.json({
      success: true,
      user: session.user,
      userDetails,
      project: {
        id: project.id,
        title: (project.projectDetails as any)?.title || 'Untitled Project',
        clientId: project.clientId,
        assignments: project.assignments.map((a: any) => ({
          id: a.id,
          status: a.status,
          developerId: a.developerId,
          developerName: (a.developer?.data as any)?.personalInfo?.firstName || 'Unknown'
        }))
      },
      hasAccess,
      expectedChatUrl: `/api/project-chat/${projectId}`
    });
    
  } catch (error) {
    console.error('Debug chat error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
