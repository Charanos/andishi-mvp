import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Fetching developer profiles from database...');
    const client = await clientPromise;
    const db = client.db();
    const records = await db.collection('developerProfiles').find({}).toArray();
    console.log(`Found ${records.length} developer profiles`);

    // Only create mock profile if no records exist at all
    if (records.length === 0) {
      console.log('No profiles found, creating mock profile...');
      const created = await db.collection('developerProfiles').insertOne({
        data: mockDeveloperProfile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json([created], { status: 200 });
    }

    const payload = await Promise.all(records.map(async (rec) => {
      const data = rec.data as DeveloperProfileData;
      const personalInfo = data?.personalInfo || {};
      const professionalInfo = data?.professionalInfo || {};
      const technicalSkills = data?.technicalSkills || {};
      const stats = data?.stats || {};

      // Get associated user
      const user = await db.collection('developers').findOne({ _id: new ObjectId(rec.userId) });

      return {
        id: rec._id.toString(),
        user,
        personalInfo: {
          firstName: personalInfo.firstName || user?.firstName || 'Unknown',
          lastName: personalInfo.lastName || user?.lastName || 'Developer',
          email: personalInfo.email || user?.email || '',
          location: personalInfo.location || 'Unknown',
          portfolio: personalInfo.portfolio || undefined,
          tagline: personalInfo.tagline || 'Full Stack Developer',
        },
        professionalInfo: {
          title: professionalInfo.title || 'Developer',
          experienceLevel: professionalInfo.experienceLevel || 'Mid-level',
          availability: professionalInfo.availability || 'Full-time',
          hourlyRate: Number(professionalInfo.hourlyRate) || 50,
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
    
    return NextResponse.json(payload, { status: 200 });
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

    // Check if user exists
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('developers').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Create developer profile
    const profile = await db.collection('developerProfiles').insertOne({
      data,
      userId: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return the created profile with user data
    const createdProfile = await db.collection('developerProfiles').findOne(
      { _id: profile.insertedId },
      {
        projection: {
          _id: 1,
          data: 1,
          userId: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    );

    return NextResponse.json({
      ...createdProfile,
      id: createdProfile?._id.toString(),
      user,
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/developer-profiles error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (isReadOnly) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const { id, data } = await req.json();

    if (!id) {
      return new NextResponse("Profile ID is required", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const profile = await db.collection('developerProfiles').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          data,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Get associated user
    const user = await db.collection('developers').findOne({ _id: new ObjectId(profile.userId) });

    return NextResponse.json({
      ...profile,
      id: profile._id.toString(),
      user,
    }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Fallback for unsupported methods
export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}