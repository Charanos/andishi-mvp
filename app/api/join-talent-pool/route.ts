import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

// GET handler to fetch all developer submissions
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('developers');
    const developers = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, developers });
  } catch (error) {
    console.error('Error fetching developers:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch developers', error: error instanceof Error ? error.message : error });
  }
}

// POST handler to add a developer to the talent pool
export async function POST (req: NextRequest) {
  try {
    const data = await req.json();
    data.createdAt = new Date();
    const client = await clientPromise;
    const db = client.db();
    const developersCol = db.collection('developers');
    const usersCol = db.collection('users');

    // 1) Insert into developers collection
    const result = await developersCol.insertOne(data);

    // 2) Upsert into users collection so the developer is visible in the admin dashboard
    const emailLower = (data.email || '').toLowerCase().trim();
    if (emailLower) {
      await usersCol.updateOne(
        { email: emailLower },
        {
          $set: {
            role: 'developer', // always ensure role
            firstName: data.firstName || data.personalInfo?.firstName || '',
            lastName: data.lastName || data.personalInfo?.lastName || '',
            isActive: true,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            email: emailLower,
            accountCreated: false,
            passwordGenerated: false,
            loginAttempts: 0,
            accountLocked: false,
            createdAt: new Date(),
          }
        },
        { upsert: true }
      );
    }

    // 3) Create developer profile if it doesn't exist
    const profilesCol = db.collection('developerProfiles');
    try {
      await profilesCol.insertOne({
        userId: result.insertedId,
        data: {
          personalInfo: data.personalInfo || {},
          professionalInfo: data.professionalInfo || {},
          technicalSkills: data.technicalSkills || {},
          workExperience: data.workExperience || [],
          projects: data.projects || [],
          stats: {
            totalProjects: 0,
            averageRating: 0,
            totalEarnings: 0,
            clientRetention: 0,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (profileErr: any) {
      // Ignore duplicate key error if profile already exists
      if (profileErr?.code !== 11000) {
        throw profileErr;
      }
    }

    return NextResponse.json({ success: true, insertedId: result.insertedId.toString() });
  } catch (error) {
    console.error('Error adding developer:', error);
    return NextResponse.json({ success: false, message: 'Failed to add developer', error: error instanceof Error ? error.message : error });
  }
}

// DELETE handler to remove a developer by _id
export async function DELETE(req: NextRequest) {
  try {
    const { _id } = await req.json();
    if (!(_id && typeof _id === 'string')) {
      return NextResponse.json({ success: false, message: 'Missing or invalid _id' }, { status: 400 });
    }
    let objectId;
    try {
      objectId = new ObjectId(_id);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid _id format' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('developers');
    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Developer not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting developer:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete developer', error: error instanceof Error ? error.message : error });
  }
}

// PUT handler to update a developer by _id
export async function PUT(req: NextRequest) {
  try {
    const { _id, ...updateData } = await req.json();
    if (!(_id && typeof _id === 'string')) {
      return NextResponse.json({ success: false, message: 'Missing or invalid _id' }, { status: 400 });
    }
    let objectId;
    try {
      objectId = new ObjectId(_id);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid _id format' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('developers');
    const result = await collection.updateOne({ _id: objectId }, { $set: updateData });
    if (result.matchedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Developer not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating developer:', error);
    return NextResponse.json({ success: false, message: 'Failed to update developer', error: error instanceof Error ? error.message : error });
  }
}
