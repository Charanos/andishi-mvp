import { NextRequest, NextResponse } from "next/server";

import { mockDeveloperProfile } from "../../../lib/mockDeveloperProfile";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

type DeveloperProfileData = {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    location?: string;
    portfolio?: string;
    tagline?: string;
  };
  professionalInfo?: {
    title?: string;
    experienceLevel?: string;
    availability?: string;
    hourlyRate?: number;
  };
  technicalSkills?: {
    primarySkills?: Array<{ name: string; level: number }>;
  };
  stats?: {
    totalProjects?: number;
    averageRating?: number;
    totalEarnings?: number;
    clientRetention?: number;
  };
  projects?: any[];
  recentActivity?: any[];
}

// NOTE: Proper authentication / RBAC is not yet wired. For now, we only allow writes
// if NODE_ENV is not production. Replace this with real admin checks later.
const isReadOnly = process.env.NODE_ENV === "production";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  // If an ID is provided, fetch a single profile
  if (id) {
    try {
      const client = await clientPromise;
      const db = client.db();
      const profile = await db
        .collection('developerProfiles')
        .findOne({ _id: new ObjectId(id) });

      if (!profile) {
        return new NextResponse('Profile not found', { status: 404 });
      }

      // Get associated user
      const user = await db
        .collection('developers')
        .findOne({ _id: new ObjectId(profile.userId) });

      return NextResponse.json({ ...profile, id: profile._id.toString(), user });
    } catch (err) {
      console.error(`GET /api/developer-profiles?id=${id} error`, err);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  try {
    console.log('Fetching developer profiles from database...');
    const client = await clientPromise;
    const db = client.db();
    const records = await db.collection('developerProfiles').find({}).toArray();
    console.log(`Found ${records.length} developer profiles`);

    // Grab all developers (used to fill gaps where profile missing)
    const developers = await db.collection('developers').find({}).toArray();

    // Map of profiles by userId for quick lookup
    const profileByUserId: Record<string, any> = {};
    records.forEach((rec) => {
      if (rec.userId) profileByUserId[rec.userId.toString()] = rec;
    });

    const merged = await Promise.all(
      developers.map(async (dev: any) => {
        const profileDoc = profileByUserId[dev._id.toString()];
        const data = (profileDoc?.data || {}) as DeveloperProfileData;
        const personalInfo = data?.personalInfo || {};
        const professionalInfo = data?.professionalInfo || {};
        const technicalSkills = data?.technicalSkills || {};
        const stats = data?.stats || {};
      return {
        id: profileDoc?._id?.toString() || dev._id.toString(),
        user: dev,
        personalInfo: {
          firstName: personalInfo.firstName || dev.firstName || 'Unknown',
          lastName: personalInfo.lastName || dev.lastName || 'Developer',
          email: personalInfo.email || dev.email || '',
          location: personalInfo.location || 'Unknown',
          portfolio: personalInfo.portfolio || undefined,
          tagline: personalInfo.tagline || 'Full Stack Developer',
        },
        professionalInfo: {
          title: professionalInfo.title || 'Developer',
          experienceLevel: professionalInfo.experienceLevel || 'Mid-level',
          availability: professionalInfo.availability || 'Full-time',
          hourlyRate:
            Number(professionalInfo.hourlyRate) || dev.hourlyRate || 50,
        },
        technicalSkills: {
          primarySkills: Array.isArray(technicalSkills.primarySkills)
            ? technicalSkills.primarySkills
            : [
                { name: 'JavaScript', level: 80 },
                { name: 'React', level: 75 },
                { name: 'Node.js', level: 70 },
              ],
        },
        stats: {
          totalProjects: Number(stats.totalProjects) || 0,
          averageRating: Number(stats.averageRating) || 0,
          totalEarnings: Number(stats.totalEarnings) || 0,
          clientRetention: Number(stats.clientRetention) || 0,
        },
        projects: Array.isArray(data?.projects) ? data.projects : [],
        recentActivity: Array.isArray(data?.recentActivity) ? data.recentActivity : [],
      };
    }));
    
    return NextResponse.json(merged, { status: 200 });
  } catch (err) {
    console.error("GET /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (isReadOnly) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const { userId, data } = await req.json();

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }
    if (!data) {
      return new NextResponse("Profile data is required", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newProfile = {
      userId: new ObjectId(userId),
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("developerProfiles")
      .insertOne(newProfile);

    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("POST /api/developer-profiles error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (isReadOnly) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const profileData = await req.json();
    const userId = profileData?.user?._id;

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Prepare the data for insertion/update, excluding fields that shouldn't be in the 'data' object
    const { id, _id, user, ...dataToSave } = profileData;

    const client = await clientPromise;
    const db = client.db();
    const result = await db
      .collection('developerProfiles')
      .findOneAndUpdate(
        { userId: new ObjectId(userId) },
        {
          $set: {
            data: dataToSave,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            userId: new ObjectId(userId),
            createdAt: new Date(),
          },
        },
        { returnDocument: 'after', upsert: true }
      );

    const updatedProfile = result ? result.value : null;

    if (!updatedProfile) {
      return new NextResponse('Profile not found or created', { status: 500 });
    }

    // Get associated user to return with the profile
    const developer = await db
      .collection('developers')
      .findOne({ _id: new ObjectId(userId) });

    // The profile data is nested inside the 'data' property. We need to un-nest it
    // and reconstruct the object to match the DeveloperProfile type, ensuring all
    // required nested objects exist to prevent frontend errors.
    const data = updatedProfile.data || {};
    const responseData = {
      id: updatedProfile._id.toString(),
      user: developer,
      personalInfo: data.personalInfo || {},
      professionalInfo: data.professionalInfo || {},
      technicalSkills: data.technicalSkills || { primarySkills: [] },
      stats: data.stats || {},
      projects: data.projects || [],
      achievements: data.achievements || [],
      recentActivity: data.recentActivity || [],
      notifications: data.notifications || [],
      timeEntries: data.timeEntries || [],
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (err) {
    console.error('PUT /api/developer-profiles error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (isReadOnly) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Profile ID is required", { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const objectId = new ObjectId(id);

    let deleted = false;

    // Case 1: The ID belongs to a developer profile.
    const profile = await db
      .collection("developerProfiles")
      .findOne({ _id: objectId });

    if (profile) {
      // Delete the profile
      await db.collection("developerProfiles").deleteOne({ _id: objectId });
      // If there's an associated user, delete them too.
      if (profile.userId) {
        await db
          .collection("developers")
          .deleteOne({ _id: new ObjectId(profile.userId) });
      }
      deleted = true;
    } else {
      // Case 2: The ID belongs to a developer record (but not a profile).
      const devDeleteResult = await db
        .collection("developers")
        .deleteOne({ _id: objectId });
      if (devDeleteResult.deletedCount > 0) {
        // Also attempt to delete any orphaned profile that might be linked to this developer.
        await db.collection("developerProfiles").deleteOne({ userId: objectId });
        deleted = true;
      }
    }

    if (!deleted) {
      return new NextResponse("Profile or Developer not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // Success
  } catch (err) {
    console.error(`DELETE /api/developer-profiles?id=${id} error`, err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Fallback for unsupported methods
export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}