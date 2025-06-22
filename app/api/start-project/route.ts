import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { startProjectFormSchema } from '@/lib/formSchema';
import { ObjectId } from 'mongodb';

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
    const parsed = startProjectFormSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('projects');
    const result = await collection.insertOne({ ...parsed.data, createdAt: new Date() });

    return NextResponse.json({ success: true, message: 'Form submitted and saved to database', insertedId: result.insertedId });
  } catch (error) {
    console.error('Error handling form submission:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit form', error: error instanceof Error ? error.message : error });
  }
}

