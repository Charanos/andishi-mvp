import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/getSession';
import { ObjectId } from 'mongodb';

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
    let db;
    try {
      const client = await clientPromise;
      db = client.db('test');
      const projectsCollection = db.collection('projects');

      // Try to find project by _id (MongoDB ObjectId)
      project = await projectsCollection.findOne({
        _id: new ObjectId(projectId)
      });

      console.log('[API] Project found:', project ? 'Yes' : 'No');
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
      project.clientId?.toString() === userId ||
      project.createdBy?.toString() === userId;

    console.log('[API] Access check:', { userRole, userId, clientId: project.clientId?.toString(), createdBy: project.createdBy?.toString(), hasAccess });

    if (!hasAccess) {
      console.log(`[API] User ${userId} does not have access to project ${projectId}`);
      return NextResponse.json(
        { success: false, error: 'Access denied' } as ApiResponse,
        { status: 403, headers: corsHeaders }
      );
    }

    const activities: ActivityItem[] = [];

    console.log('[API] Generating activities for project:', project.title);

    // 1. Add project creation activity
    activities.push({
      id: `project-created-${project._id}`,
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

    // 2. Add project completion activity if completed
    if (project.actualCompletionDate) {
      activities.push({
        id: `project-completed-${project._id}`,
        type: 'milestone',
        title: 'Project Completed',
        description: `Project "${project.title}" was marked as completed`,
        createdAt: project.actualCompletionDate,
        actor: {
          id: 'system',
          name: 'System',
          role: 'system'
        }
      });
    }

    // 3. Try to fetch chat messages from MongoDB
    try {
      const chatsCollection = db.collection('chats');
      const chatMessagesCollection = db.collection('chatMessages');

      // Find chat for this project
      const projectChat = await chatsCollection.findOne({
        projectId: new ObjectId(projectId)
      });

      if (projectChat) {
        // Find recent messages
        const recentMessages = await chatMessagesCollection.find({
          chatId: projectChat._id
        }).sort({ timestamp: -1 }).limit(10).toArray();

        recentMessages.forEach((message: any) => {
          activities.push({
            id: `chat-${message._id}`,
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
    } catch (chatError) {
      console.error('[API] Error fetching chat messages:', chatError);
    }

    // 4. Try to fetch project assignments
    try {
      const assignmentsCollection = db.collection('projectAssignments');
      const assignments = await assignmentsCollection.find({
        projectId: new ObjectId(projectId)
      }).sort({ assignedAt: -1 }).toArray();

      assignments.forEach((assignment: any) => {
        activities.push({
          id: `assignment-${assignment._id}`,
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
    } catch (assignmentError) {
      console.error('[API] Error fetching assignments:', assignmentError);
    }

    // Sort all activities by createdAt (most recent first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit to most recent activities
    const recentActivities = activities.slice(0, 20);

    console.log(`[API] Returning ${recentActivities.length} activities for project ${projectId}`);
    console.log('[API] Activities data:', JSON.stringify(recentActivities, null, 2));

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