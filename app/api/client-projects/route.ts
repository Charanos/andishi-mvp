import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add type definitions
interface ProjectMilestone {
  _id?: ObjectId;
  id?: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  status: string;
  dueDate?: Date;
  completedAt?: Date;
  order: number;
}

interface ProjectUpdate {
  _id?: ObjectId;
  id?: string;
  title: string;
  description: string;
  type: string;
  createdAt: Date;
}

interface ProjectFile {
  _id?: ObjectId;
  id?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  createdAt: Date;
}

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

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found or not authorized' },
        { status: 404 }
      );
    }

    // Find projects either by clientId or userInfo.email
    const projects = await db.collection('projects').find({
      $or: [
        { clientId: user._id.toString() },
        { 'userInfo.email': userEmail }
      ]
    }).sort({ createdAt: -1 }).toArray();

    // Update user's project count if it doesn't match
    const projectCount = projects.length;
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { projectCount: projectCount } }
    );

    // Transform projects to ensure consistent structure
    const transformedProjects = projects.map(project => ({
      id: project._id.toString(),
      title: project.title || '',
      description: project.description || '',
      status: project.status || 'pending',
      priority: project.priority || project.projectDetails?.priority || 'low',
      progress: project.progress || 0,
      techStack: project.techStack || project.projectDetails?.techStack || [],
      createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
      updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date(),
      category: project.category || project.projectDetails?.category,
      timeline: project.timeline || project.projectDetails?.timeline,
      requirements: project.requirements || project.projectDetails?.requirements,
      startDate: project.startDate ? new Date(project.startDate) : undefined,
      endDate: project.endDate ? new Date(project.endDate) : undefined,
      estimatedCompletionDate: project.estimatedCompletionDate ? new Date(project.estimatedCompletionDate) : undefined,
      actualCompletionDate: project.actualCompletionDate ? new Date(project.actualCompletionDate) : undefined,
      pricing: project.pricing ? {
        type: project.pricing.type || 'fixed',
        currency: project.pricing.currency || 'USD',
        fixedBudget: project.pricing.fixedBudget,
        hourlyRate: project.pricing.hourlyRate,
        estimatedHours: project.pricing.estimatedHours,
        totalPaid: project.pricing.totalPaid
      } : undefined,
      milestones: (project.milestones || []).map((m: ProjectMilestone) => ({
        id: m._id?.toString() || m.id,
        title: m.title,
        description: m.description,
        budget: m.budget,
        timeline: m.timeline,
        status: m.status || 'pending',
        dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
        completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
        order: m.order || 0
      })),
      updates: (project.updates || []).map((u: ProjectUpdate) => ({
        id: u._id?.toString() || u.id,
        title: u.title,
        description: u.description,
        type: u.type || 'general',
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date()
      })),
      files: (project.files || []).map((f: ProjectFile) => ({
        id: f._id?.toString() || f.id,
        fileName: f.fileName,
        fileUrl: f.fileUrl,
        fileSize: f.fileSize,
        fileType: f.fileType,
        createdAt: f.createdAt ? new Date(f.createdAt) : new Date()
      })),
      userInfo: project.userInfo || {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        company: user.company || '',
        role: 'client'
      },
      projectDetails: {
        ...project.projectDetails,
        priority: project.projectDetails?.priority || project.priority || 'low',
        techStack: project.projectDetails?.techStack || []
      }
    }));

    return NextResponse.json({
      success: true,
      projects: transformedProjects
    });

  } catch (error) {
    console.error('Error fetching client projects:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects', error: error instanceof Error ? error.message : error },
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
      projectDetails: {
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        timeline: projectData.timeline,
        priority: projectData.priority || 'medium',
        techStack: projectData.techStack || [],
        requirements: projectData.requirements
      },
      status: 'pending',
      priority: projectData.priority || 'medium',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      clientId: user._id,
      userInfo: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company
      }
    };

    const result = await db.collection('projects').insertOne(projectToInsert);

    // Update user's project count
    await db.collection('users').updateOne(
      { _id: user._id },
      { $inc: { projectCount: 1 } }
    );

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

    // Update user's project count
    await db.collection('users').updateOne(
      { _id: user._id },
      { $inc: { projectCount: -1 } }
    );

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