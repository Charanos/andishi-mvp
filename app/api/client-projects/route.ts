import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

// GET handler to fetch projects for the logged-in client
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const userEmail = req.headers.get('user-email');
    const userRole = req.headers.get('user-role');
    const token = authHeader?.replace('Bearer ', '');

    if (!token || !userEmail) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // First, get the user to verify they are a client
    const user = await db.collection('users').findOne({
      email: userEmail,
      role: 'client',
      isActive: true
    });

    if (!user || userRole !== 'client') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Fetch all projects for this client
    const projects = await db.collection('projects')
      .find({
        'userInfo.email': userEmail
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Transform projects to match the client dashboard interface
    const transformedProjects = projects.map(project => ({
      id: project._id.toString(),
      title: project.projectDetails.title,
      description: project.projectDetails.description,
      category: project.projectDetails.category,
      timeline: project.projectDetails.timeline,
      priority: project.projectDetails.priority || "low",
      techStack: project.projectDetails.techStack,
      requirements: project.projectDetails.requirements,
      status: project.status || 'pending',
      progress: project.progress || 0,
      startDate: project.startDate,
      endDate: project.endDate,
      estimatedCompletionDate: project.estimatedCompletionDate,
      actualCompletionDate: project.actualCompletionDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      pricing: {
        type: project.pricing?.type || 'fixed',
        currency: project.pricing?.currency || 'USD',
        fixedBudget: project.pricing?.fixedBudget,
        hourlyRate: project.pricing?.hourlyRate,
        estimatedHours: project.pricing?.estimatedHours,
        totalPaid: project.pricing?.totalPaid
      },
      milestones: project.milestones || [],
      updates: project.updates || [],
      files: project.files || []
    }));

    return NextResponse.json({ 
      success: true, 
      projects: transformedProjects 
    });

  } catch (error) {
    console.error('Error fetching client projects:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch projects',
        error: error instanceof Error ? error.message : error 
      },
      { status: 500 }
    );
  }
}

// POST handler to create a new project
export async function POST(req: NextRequest) {
  try {
    const userEmail = req.headers.get('user-email');

    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify user is a client
    const user = await db.collection('users').findOne({
      email: userEmail,
      role: 'client',
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const projectData = await req.json();

    // Add metadata
    const now = new Date();
    const projectToInsert = {
      ...projectData,
      status: 'pending',
      priority: projectData.priority || 'medium',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      clientId: user._id
    };

    const result = await db.collection('projects').insertOne(projectToInsert);

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      projectId: result.insertedId
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create project',
        error: error instanceof Error ? error.message : error 
      },
      { status: 500 }
    );
  }
}

// PATCH handler to update a project
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify user is a client
    const user = await db.collection('users').findOne({
      email: req.headers.get('user-email'),
      role: 'client',
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { projectId, updates } = await req.json();

    if (!projectId || !updates) {
      return NextResponse.json(
        { success: false, message: 'Project ID and updates are required' },
        { status: 400 }
      );
    }

    // Verify the project belongs to this client
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
      clientId: user._id
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // Update the project
    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update project',
        error: error instanceof Error ? error.message : error 
      },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a project
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Verify user is a client
    const user = await db.collection('users').findOne({
      email: req.headers.get('user-email'),
      role: 'client',
      isActive: true
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify the project belongs to this client
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId),
      clientId: user._id
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete the project
    const result = await db.collection('projects').deleteOne({
      _id: new ObjectId(projectId)
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete project',
        error: error instanceof Error ? error.message : error 
      },
      { status: 500 }
    );
  }
} 