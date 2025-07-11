import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/getSession';

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
    console.log('[API] Route accessed:', req.url);
    console.log('[API] Method:', req.method);

    const { projectId } = await context.params;
    console.log(`[API] Fetching activity for project: ${projectId}`);

    // Validate projectId format (assuming UUID)
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
      console.log('[API] Invalid project ID format');
      return NextResponse.json(
        { success: false, error: 'Invalid project ID format' } as ApiResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    const session = await getSession(req);
    console.log('[API] Session:', session?.user?.id ? 'Valid' : 'Invalid');

    if (!session?.user?.id) {
      console.log('[API] No valid session found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' } as ApiResponse,
        { status: 401, headers: corsHeaders }
      );
    }

    let project;
    try {
      project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          assignments: {
            include: {
              developer: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    } catch (dbError) {
      console.error('[API] Database error while fetching project:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database error' } as ApiResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    if (!project) {
      console.log(`[API] Project with id ${projectId} not found in database`);
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
      project.clientId === userId ||
      project.assignments.some(a => a.developer?.userId === userId);

    if (!hasAccess) {
      console.log(`[API] User ${userId} does not have access to project ${projectId}`);
      return NextResponse.json(
        { success: false, error: 'Access denied' } as ApiResponse,
        { status: 403, headers: corsHeaders }
      );
    }

    const activities: ActivityItem[] = [];

    // 1. Fetch Chat Messages (system messages and regular messages)
    try {
      const chatMessages = await prisma.chatMessage.findMany({
        where: {
          chat: {
            projectId: projectId
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 50
      });

      // Convert chat messages to activities
      chatMessages.forEach(message => {
        if (message.senderId === 'system') {
          activities.push({
            id: `chat-${message.id}`,
            type: 'system',
            title: 'System Notification',
            description: message.content,
            createdAt: message.timestamp,
            actor: {
              id: 'system',
              name: 'System',
              role: 'system'
            }
          });
        } else {
          activities.push({
            id: `chat-${message.id}`,
            type: 'chat',
            title: `${message.senderName} sent a message`,
            description: message.content.length > 100 ?
              `${message.content.substring(0, 100)}...` :
              message.content,
            createdAt: message.timestamp,
            actor: {
              id: message.senderId,
              name: message.senderName,
              role: message.senderRole
            }
          });
        }
      });
    } catch (chatError) {
      console.error('[API] Error fetching chat messages:', chatError);
      // Don't fail the entire request, just log the error
    }

    // 2. Fetch Assignment Activities
    try {
      const assignments = await prisma.projectAssignment.findMany({
        where: {
          projectId: projectId
        },
        include: {
          developer: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        }
      });

      assignments.forEach(assignment => {
        const developerName = assignment.developer?.user
          ? `${assignment.developer.user.firstName} ${assignment.developer.user.lastName}`
          : 'Unknown Developer';

        activities.push({
          id: `assignment-${assignment.id}`,
          type: 'assignment',
          title: `${developerName} was assigned`,
          description: `Added as ${assignment.role} to the project team`,
          createdAt: assignment.assignedAt,
          actor: {
            id: 'system',
            name: 'System',
            role: 'system'
          },
          metadata: {
            developerId: assignment.developerId,
            role: assignment.role,
            status: assignment.status
          }
        });
      });
    } catch (assignmentError) {
      console.error('[API] Error fetching assignments:', assignmentError);
      // Don't fail the entire request, just log the error
    }

    // 3. Add project creation activity
    activities.push({
      id: `project-created-${project.id}`,
      type: 'system',
      title: 'Project Created',
      description: `Project "${project.title}" was created`,
      createdAt: project.createdAt,
      actor: {
        id: 'system',
        name: 'System',
        role: 'system'
      }
    });

    // Sort all activities by createdAt (most recent first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit to most recent activities
    const recentActivities = activities.slice(0, 20);

    console.log(`[API] Returning ${recentActivities.length} activities for project ${projectId}`);

    return NextResponse.json({
      success: true,
      data: recentActivities,
      count: recentActivities.length
    } as ApiResponse, {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('[API] Unexpected error in GET /api/project-activity/[projectId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500, headers: corsHeaders }
    );
  }
}