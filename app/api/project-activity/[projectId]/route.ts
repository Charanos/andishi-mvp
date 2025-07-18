import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/getSession';
import prisma from '@/lib/prisma';

export interface ActivityItem {
  id: string;
  type: 'chat' | 'assignment' | 'milestone' | 'payment' | 'update' | 'system';
  title: string;
  description: string;
  createdAt: Date | string;
  actor?: {
    id: string;
    name: string;
    role: string;
  };
  metadata?: any;
  activityType?: string;
}

interface ApiResponse {
  success: boolean;
  data?: ActivityItem[];
  count?: number;
  error?: string;
}

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}

// GET /api/project-activity/[projectId] - Get unified activity feed for a project
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    // Add debug logging for the request
    
    

    const { projectId } = await context.params;
    

    // Validate projectId format (assuming UUID)
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      
      return NextResponse.json(
        { success: false, error: 'Invalid project ID format' } as ApiResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    const session = await getSession(req);
    

    if (!session?.user?.id) {
      
      return NextResponse.json(
        { success: false, error: 'Authentication required' } as ApiResponse,
        { status: 401, headers: corsHeaders }
      );
    }

    let project;
    try {
      // Use Prisma to find project by id
      project = await prisma.project.findUnique({
        where: { id: projectId }
      });
    } catch (dbError) {
      
      return NextResponse.json(
        { success: false, error: 'Database error' } as ApiResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    if (!project) {
      
      return NextResponse.json(
        { success: false, error: 'Project not found' } as ApiResponse,
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if user has access to this project
    const userRole = session.user.role;
    const userId = session.user.id;
    const hasAccess =
      userRole === 'admin' ||
      project.clientId?.toString() === userId;

    

    if (!hasAccess) {
      
      return NextResponse.json(
        { success: false, error: 'Access denied' } as ApiResponse,
        { status: 403, headers: corsHeaders }
      );
    }

    const activities: ActivityItem[] = [];

    

    // 1. Add project creation activity
    activities.push({
      id: `project-created-${project.id}`,
      type: 'system',
      title: 'Project Created',
      description: `Project "${(project.projectDetails as any)?.title || 'Untitled Project'}" was created`,
      createdAt: project.createdAt,
      actor: {
        id: 'system',
        name: 'System',
        role: 'system'
      }
    });

    // 2. Add project completion activity if completed
    if (project.estimatedCompletionDate && project.status === 'completed') {
      activities.push({
        id: `project-completed-${project.id}`,
        type: 'milestone',
        title: 'Project Completed',
        description: `Project "${(project.projectDetails as any)?.title || 'Untitled Project'}" was marked as completed`,
        createdAt: project.estimatedCompletionDate,
        actor: {
          id: 'system',
          name: 'System',
          role: 'system'
        }
      });
    }

    // 3. Add project updates (if they exist in the project data)
    // Note: updates are not in the Prisma schema, so we'll skip this for now

    // 4. Add milestones
    if (project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0) {
      project.milestones.forEach((milestone: any) => {
        activities.push({
          id: `milestone-${milestone.id}`,
          type: 'milestone',
          title: `Milestone: ${milestone.title}`,
          description: `Status: ${milestone.status}`,
          createdAt: milestone.dueDate || new Date(),
          actor: {
            id: 'system',
            name: 'System',
            role: 'system'
          }
        });
      });
    }

    // 5. Add payments (if they exist in the project data)
    // Note: payments are not in the Prisma schema, so we'll skip this for now

    // 6. Fetch chat messages using Prisma
    const projectChat = await prisma.projectChat.findFirst({
      where: { projectId: projectId },
      include: { messages: { orderBy: { timestamp: 'desc' }, take: 10 } }
    });

    if (projectChat && projectChat.messages) {
      projectChat.messages.forEach((message) => {
        activities.push({
          id: `chat-${message.id}`,
          type: 'chat',
          title: `${message.senderName || 'User'} sent a message`,
          description: message.content.length > 100 ?
            `${message.content.substring(0, 100)}...` :
            message.content,
          createdAt: message.timestamp,
          actor: {
            id: message.senderId || 'unknown',
            name: message.senderName || 'Unknown User',
            role: message.senderRole || 'user'
          }
        });
      });
    }

    // 7. Fetch project assignments using Prisma
    const assignments = await prisma.projectAssignment.findMany({
      where: { projectId: projectId },
      orderBy: { assignedAt: 'desc' }
    });

    assignments.forEach((assignment) => {
      activities.push({
        id: `assignment-${assignment.id}`,
        type: 'assignment',
        title: `Developer assigned to project`,
        description: `A developer was assigned to work on this project`,
        createdAt: assignment.assignedAt,
        actor: {
          id: 'system',
          name: 'System',
          role: 'system'
        }
      });
    });

    // Sort all activities by createdAt (most recent first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit to most recent activities
    const recentActivities = activities.slice(0, 20);

    
    

    return NextResponse.json({
      success: true,
      data: recentActivities,
      count: recentActivities.length
    } as ApiResponse, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500, headers: corsHeaders }
    );
  }
}