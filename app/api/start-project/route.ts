import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { startProjectFormSchema, authenticatedStartProjectFormSchema } from '@/lib/formSchema';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Type for the parsed data from the form schemas
type ParsedData = z.infer<typeof startProjectFormSchema> | z.infer<typeof authenticatedStartProjectFormSchema>;

// GET handler to fetch all project submissions
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('projects');
    const projects = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch projects', error: error instanceof Error ? error.message : error });
  }
}

// DELETE handler to remove a project by _id
export async function DELETE(req: NextRequest) {
  try {
    const { _id } = await req.json();
    if (!(_id && typeof _id === 'string')) {
      return NextResponse.json({ success: false, message: 'Missing or invalid _id' }, { status: 400 });
    }
    let objectId;
    try {
      objectId = new ObjectId(_id);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid project _id' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('projects');
    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true, message: 'Project deleted' });
    } else {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete project', error: error instanceof Error ? error.message : error });
  }
}

// PATCH handler to update project status
export async function PATCH(req: NextRequest) {
  try {
    const { _id, status } = await req.json();
    if (!(_id && typeof _id === 'string')) {
      return NextResponse.json({ success: false, message: 'Missing or invalid _id' }, { status: 400 });
    }
    const allowedStatuses = ['pending', 'reviewed', 'approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('projects');
    let objectId;
    try {
      objectId = new ObjectId(_id);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid project _id' }, { status: 400 });
    }
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { status } }
    );
    if (result.modifiedCount === 1) {
      return NextResponse.json({ success: true, message: 'Project status updated' });
    } else {
      return NextResponse.json({ success: false, message: 'Project not found or status unchanged' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json({ success: false, message: 'Failed to update status', error: error instanceof Error ? error.message : error });
  }
}

// This handler receives form submissions from the Start Project form
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received data:', data);

    // Check if this is an authenticated submission (has userId)
    const isAuthenticated = !!(data.userId && typeof data.userId === 'string');
    console.log('Is authenticated:', isAuthenticated);

    let parsed;
    let userId;
    const client = await clientPromise;
    const db = client.db();
    let existingUser = null;

    if (isAuthenticated) {
      // For authenticated submissions, validate the project data structure
      const projectData = {
        projectDetails: {
          ...data.projectDetails,
          techStack: data.projectDetails?.techStack || [],
          priority: data.projectDetails?.priority || "low"
        },
        pricing: {
          ...data.pricing,
          type: data.pricing?.type || "fixed",
          currency: data.pricing?.currency || "USD",
          milestones: data.pricing?.milestones || []
        }
      };

      console.log('Validating authenticated project data:', projectData);

      // Use the authenticated schema for validation
      const validationResult = authenticatedStartProjectFormSchema.safeParse(projectData);
      if (!validationResult.success) {
        const errors = validationResult.error.format();
        console.error("Authenticated validation errors:", errors);
        return NextResponse.json({
          success: false,
          message: 'Validation failed',
          errors
        }, { status: 400 });
      }
      parsed = validationResult;

      // Validate and convert userId
      try {
        userId = new ObjectId(data.userId);
      } catch (e) {
        return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 });
      }

      // Get user information for the authenticated user
      existingUser = await db.collection('users').findOne({ _id: userId });
      if (!existingUser) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }
    } else {
      // For unauthenticated submissions, validate the full form including user info
      const fullData = {
        userInfo: {
          ...data.userInfo,
          role: data.userInfo?.role || "client"
        },
        projectDetails: {
          ...data.projectDetails,
          techStack: data.projectDetails?.techStack || [],
          priority: data.projectDetails?.priority || "low"
        },
        pricing: {
          ...data.pricing,
          type: data.pricing?.type || "fixed",
          currency: data.pricing?.currency || "USD",
          milestones: data.pricing?.milestones || []
        }
      };

      console.log('Validating unauthenticated full data:', fullData);

      const validationResult = startProjectFormSchema.safeParse(fullData);
      if (!validationResult.success) {
        const errors = validationResult.error.format();
        console.error("Unauthenticated validation errors:", errors);
        return NextResponse.json({
          success: false,
          message: 'Validation failed',
          errors
        }, { status: 400 });
      }
      parsed = validationResult;

      // For unauthenticated users, handle user creation/lookup
      const userInfo = (parsed.data as z.infer<typeof startProjectFormSchema>).userInfo;
      existingUser = await db.collection('users').findOne({
        email: userInfo.email.toLowerCase()
      });

      if (!existingUser) {
        // Create new user with client role
        const now = new Date();
        const newUser = {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email.toLowerCase(),
          phone: userInfo.phone,
          company: userInfo.company,
          role: 'client',
          isActive: true,
          createdAt: now,
          updatedAt: now,
          projectsCount: 1
        };

        const result = await db.collection('users').insertOne(newUser);
        existingUser = { ...newUser, _id: result.insertedId };
      } else {
        // Update existing user's project count
        await db.collection('users').updateOne(
          { _id: existingUser._id },
          {
            $inc: { projectsCount: 1 },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }

    // Prepare project data with user information
    const projectToSave = {
      ...(isAuthenticated ? parsed.data : (parsed.data as any)),
      clientId: existingUser._id.toString(),
      userInfo: {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        phone: existingUser.phone || '',
        company: existingUser.company || '',
        role: 'client'
      },
      projectDetails: {
        ...(isAuthenticated ? parsed.data.projectDetails : (parsed.data as any).projectDetails),
        priority: parsed.data.projectDetails?.priority || 'low',
        techStack: parsed.data.projectDetails?.techStack || []
      },
      status: 'pending',
      priority: parsed.data.projectDetails?.priority || 'low',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save the project
    const result = await db.collection('projects').insertOne(projectToSave);

    return NextResponse.json({
      success: true,
      message: 'Project submitted successfully',
      projectId: result.insertedId
    });

  } catch (error) {
    console.error('Error submitting project:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to submit project',
      error: error instanceof Error ? error.message : error
    }, { status: 500 });
  }
}

