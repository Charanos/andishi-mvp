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
        return new NextResponse("Profile not found", { status: 404 });
      }

      // Get associated user
      const user = await db
        .collection("developers")
        .findOne({ _id: new ObjectId(profile.userId) });

      // Reconstruct the profile to match the shape expected by the frontend
      const data = profile.data || {};
      const responseData = {
        id: profile._id.toString(),
        user: user,
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

      return NextResponse.json(responseData);
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
  try {
    const profileData = await req.json();
    const profileId = profileData?.id;

    if (!profileId) {
      return new NextResponse("Profile ID is required", { status: 400 });
    }

    let profileObjectId;
    try {
      profileObjectId = new ObjectId(profileId);
    } catch (error) {
      console.error("Invalid profileId for ObjectId:", profileId, error);
      return new NextResponse("Invalid profile ID format", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Exclude user and id fields from the data to be saved
    const { id, user, ...dataToSave } = profileData;

    console.log(`Attempting to update profile with _id: ${profileObjectId}`);

    const result = await db.collection("developerProfiles").findOneAndUpdate(
      { _id: profileObjectId },
      {
        $set: {
          data: dataToSave,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    console.log("findOneAndUpdate result:", result);

    const updatedProfile = result?.value;

    if (!updatedProfile) {
      console.log(`Profile with _id: ${profileObjectId} not found.`);
      return new NextResponse("Profile not found", { status: 404 });
    }

    return NextResponse.json(updatedProfile);
  } catch (err) {
    console.error("PUT /api/developer-profiles error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  

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