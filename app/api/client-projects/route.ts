import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
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

// Helper to extract auth info if middleware headers are missing
const authenticateRequest = async (req: NextRequest) => {
  const headerEmail = req.headers.get('user-email');
  const headerRole = req.headers.get('user-role');
  if (headerEmail && headerRole) {
    return { userEmail: headerEmail, userRole: headerRole };
  }

  // Fallback to cookie verification (for routes that bypass middleware)
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return { userEmail: null, userRole: null };

  try {
    const secretValue = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secretValue) throw new Error('JWT secret missing');
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);
    return { userEmail: payload.email as string, userRole: payload.role as string };
  } catch {
    return { userEmail: null, userRole: null };
  }
};

// GET handler to fetch projects for the logged-in client
export async function GET(req: NextRequest) {
  try {
    const { userEmail, userRole } = await authenticateRequest(req);

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    let projects: any[] = [];
    let clientUser: any = null; // populated for client role

    if (userRole === 'admin') {
      // Admins have access to all projects
      projects = await db
        .collection('projects')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    } else {
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
      projects = await db
        .collection('projects')
        .find({
          $or: [
            { clientId: user._id.toString() },
            { 'userInfo.email': userEmail }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray();

      // Update user's project count if it doesn't match
      const projectCount = projects.length;
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { projectCount } }
      );
    }

    // Transform projects to ensure consistent structure
    const transformedProjects = projects.map(project => ({
      _id: project._id.toString(),
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
      milestones: (project.milestones && project.milestones.length ? project.milestones : project.pricing?.milestones || []).map((m: ProjectMilestone) => ({
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
      payments: (project.payments || []).map((p: any) => ({
        id: p._id?.toString() || p.id,
        amount: p.amount,
        method: p.method,
        notes: p.notes,
        date: p.date ? new Date(p.date) : undefined,
      })),
      files: (project.files || []).map((f: ProjectFile) => ({
        id: f._id?.toString() || f.id,
        fileName: f.fileName,
        fileUrl: f.fileUrl,
        fileSize: f.fileSize,
        fileType: f.fileType,
        createdAt: f.createdAt ? new Date(f.createdAt) : new Date()
      })),
      userInfo: project.userInfo || (clientUser ? {
        firstName: clientUser.firstName,
        lastName: clientUser.lastName,
        email: clientUser.email,
        phone: clientUser.phone || '',
        company: clientUser.company || '',
        role: 'client'
      } : {}),
      projectDetails: {
        ...project.projectDetails,
        priority: project.projectDetails?.priority || project.priority || 'low',
        techStack: project.projectDetails?.techStack || []
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedProjects
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
    const { userEmail, userRole } = await authenticateRequest(req);

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // For client role ensure user exists and active, for admin skip
    let clientUser: any = null;
    if (userRole === 'client') {
      clientUser = await db.collection('users').findOne({
        email: userEmail,
        role: 'client',
        isActive: true
      });
      if (!clientUser) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized access' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    console.log('Received PATCH request with body:', body);
    const { projectId, ...updates } = body;

    if (!projectId || Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Project ID and at least one update field are required',
        },
        { status: 400 }
      );
    }

    // Verify the project belongs to the client or allow admin
    let project;
    if (userRole === 'admin') {
      project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId)
      });
    } else {
      project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId),
        clientId: clientUser._id
      });
    }

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // Build dynamic update operations
    const setOps: Record<string, any> = { updatedAt: new Date() };
    const pushOps: Record<string, any> = {};

    if (updates.status !== undefined) setOps.status = updates.status;
    if (updates.progress !== undefined) setOps.progress = updates.progress;

    // Push array-like updates
    if (Array.isArray(updates.updates) && updates.updates.length) {
      pushOps.updates = { $each: updates.updates };
    }
    if (Array.isArray(updates.files) && updates.files.length) {
      pushOps.files = { $each: updates.files };
    }
    if (Array.isArray(updates.payments) && updates.payments.length) {
      const paymentsToPush = updates.payments.map((p: any) => ({
        ...p,
        _id: new ObjectId(),
        date: p.date ? new Date(p.date) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      pushOps.payments = { $each: paymentsToPush };
    }

    const updateQuery: Record<string, any> = {};
    if (Object.keys(setOps).length) updateQuery.$set = setOps;
    if (Object.keys(pushOps).length) updateQuery.$push = pushOps;

    // Milestone updates can be either add new or modify existing
    let milestoneResult = { modifiedCount: 0 };
    if (updates.milestones) {
      const ms = updates.milestones as any; // expected { id, ...fields }
      if (ms.id) {
        // update existing milestone
        const milestoneSet: Record<string, any> = {};
        if (ms.title !== undefined) milestoneSet['milestones.$.title'] = ms.title;
        if (ms.description !== undefined) milestoneSet['milestones.$.description'] = ms.description;
        if (ms.budget !== undefined) milestoneSet['milestones.$.budget'] = ms.budget; // Fixing the typo from 'budget' to 'budget'
        if (ms.timeline !== undefined) milestoneSet['milestones.$.timeline'] = ms.timeline;
        if (ms.status !== undefined) milestoneSet['milestones.$.status'] = ms.status;
        if (ms.dueDate !== undefined) milestoneSet['milestones.$.dueDate'] = new Date(ms.dueDate);
        if (ms.completedAt !== undefined) milestoneSet['milestones.$.completedAt'] = new Date(ms.completedAt);
        milestoneSet['milestones.$.updatedAt'] = new Date();

        const isValidObjectId = typeof ms.id === 'string' && /^[a-fA-F0-9]{24}$/.test(ms.id);
        const milestoneQuery = isValidObjectId
          ? { _id: new ObjectId(projectId), 'milestones._id': new ObjectId(ms.id) }
          : { _id: new ObjectId(projectId), 'milestones.id': ms.id };

        milestoneResult = await db.collection('projects').updateOne(
          milestoneQuery,
          { $set: milestoneSet }
        );
      } else {
        // add new milestone
        const generatedId = new ObjectId();
        const newMilestoneWithId = {
          ...ms,
          _id: generatedId,
          id: generatedId.toString(),
          status: ms.status || 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        updateQuery.$push = {
          ...updateQuery.$push,
          milestones: newMilestoneWithId,
        };
      }
    }

    // Execute main update if there is something to do
    let result = { modifiedCount: 0 };
    if (Object.keys(updateQuery).length) {
      result = await db.collection('projects').updateOne(
        { _id: new ObjectId(projectId) },
        updateQuery
      );
    }

    const modifiedCount = (result?.modifiedCount || 0) + (milestoneResult?.modifiedCount || 0);

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      modifiedCount: modifiedCount
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
    const { userEmail, userRole } = await authenticateRequest(req);

    if (!userEmail || !userRole) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    let clientUser: any = null;
    if (userRole === 'client') {
      clientUser = await db.collection('users').findOne({
        email: userEmail,
        role: 'client',
        isActive: true
      });
      if (!clientUser) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized access' },
          { status: 403 }
        );
      }
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    let project;
    if (userRole === 'admin') {
      project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId)
      });
    } else {
      project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId),
        clientId: clientUser._id
      });
    }

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

    // Decrement project count for client user
    if (userRole === 'client') {
      await db.collection('users').updateOne(
        { _id: clientUser._id },
        { $inc: { projectCount: -1 } }
      );
    }

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