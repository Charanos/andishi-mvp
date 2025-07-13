import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// GET /api/developer-profiles/[developerId] - return single profile
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400, headers: corsHeaders });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(developerId);
    } catch (error) {
      return new NextResponse("Invalid profile ID format", { status: 400, headers: corsHeaders });
    }

    const client = await clientPromise;
    const db = client.db();

    const profile = await db.collection('developerProfiles').findOne({ _id: objectId });

    if (!profile) return new NextResponse("Not Found", { status: 404, headers: corsHeaders });
    
    // Return properly formatted response matching DeveloperProfile structure
    const responseData = {
      id: profile._id.toString(),
      personalInfo: profile.data.personalInfo,
      professionalInfo: profile.data.professionalInfo,
      technicalSkills: profile.data.technicalSkills,
      stats: profile.data.stats,
      projects: profile.data.projects || [],
      recentActivity: profile.data.recentActivity || [],
      achievements: profile.data.achievements || [],
      notifications: profile.data.notifications || [],
      timeEntries: profile.data.timeEntries || [],
      status: profile.status || "pending",
      isAvailable: profile.isAvailable || false,
      createdAt: profile.createdAt?.toISOString() || new Date().toISOString(),
    };
    
    return new NextResponse(JSON.stringify(responseData), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("GET /api/developer-profiles/[developerId]", err);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// PUT /api/developer-profiles/[developerId] - update profile
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;
    const payload = await req.json();

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400, headers: corsHeaders });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(developerId);
    } catch (error) {
      return new NextResponse("Invalid profile ID format", { status: 400, headers: corsHeaders });
    }

    const client = await clientPromise;
    const db = client.db();

    const existingProfile = await db.collection('developerProfiles').findOne({ _id: objectId });

    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    // Extract the id from payload and store the rest as data
    const { id, ...profileData } = payload;

    const result = await db.collection('developerProfiles').findOneAndUpdate(
      { _id: objectId },
      { 
        $set: { 
          data: profileData,
          status: payload.status || existingProfile.status,
          isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : existingProfile.isAvailable,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    );

    const updatedProfile = result?.value;
    if (!updatedProfile) {
      return new NextResponse("Failed to update profile", { status: 500, headers: corsHeaders });
    }

    // Return properly formatted response matching DeveloperProfile structure
    const responseData = {
      id: updatedProfile._id.toString(),
      personalInfo: updatedProfile.data.personalInfo,
      professionalInfo: updatedProfile.data.professionalInfo,
      technicalSkills: updatedProfile.data.technicalSkills,
      stats: updatedProfile.data.stats,
      projects: updatedProfile.data.projects || [],
      recentActivity: updatedProfile.data.recentActivity || [],
      achievements: updatedProfile.data.achievements || [],
      notifications: updatedProfile.data.notifications || [],
      timeEntries: updatedProfile.data.timeEntries || [],
      status: updatedProfile.status || "pending",
      isAvailable: updatedProfile.isAvailable || false,
      createdAt: updatedProfile.createdAt?.toISOString() || new Date().toISOString(),
    };

    return new NextResponse(JSON.stringify(responseData), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("PUT /api/developer-profiles/[developerId]", err);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/developer-profiles/[developerId] - remove profile
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400, headers: corsHeaders });
    }

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(developerId);
    } catch (error) {
      return new NextResponse("Invalid profile ID format", { status: 400, headers: corsHeaders });
    }

    const client = await clientPromise;
    const db = client.db();

    const existingProfile = await db.collection('developerProfiles').findOne({ _id: objectId });

    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    await db.collection('developerProfiles').deleteOne({ _id: objectId });
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    console.error("DELETE /api/developer-profiles/[developerId]", err);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}
