import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';

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

    const profile = await prisma.developerProfile.findUnique({
      where: { id: developerId }
    });

    if (!profile) return new NextResponse("Not Found", { status: 404, headers: corsHeaders });
    
    // Return properly formatted response matching DeveloperProfile structure
    const profileData = profile.data as any;
    const responseData = {
      id: profile.id,
      data: {
        personalInfo: profileData.personalInfo || {},
        professionalInfo: profileData.professionalInfo || {},
        technicalSkills: profileData.technicalSkills || {},
        stats: profileData.stats || {},
        projects: profileData.projects || [],
        recentActivity: profileData.recentActivity || [],
        achievements: profileData.achievements || [],
        notifications: profileData.notifications || [],
        timeEntries: profileData.timeEntries || [],
      },
      status: profile.status || "pending",
      isAvailable: profile.isAvailable || false,
      busyUntilDate: profile.busyUntilDate || null,
      createdAt: profile.createdAt.toISOString(),
    };
    
    return NextResponse.json(responseData, { status: 200, headers: corsHeaders });
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

    const existingProfile = await prisma.developerProfile.findUnique({
      where: { id: developerId }
    });

    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    // Extract the id from payload and store the rest as data
    const { id, ...profileData } = payload;
    
    console.log('Updating profile with data:', JSON.stringify(profileData, null, 2));

    const updatedProfile = await prisma.developerProfile.update({
      where: { id: developerId },
      data: {
        data: profileData,
        status: payload.status || existingProfile.status,
        isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : existingProfile.isAvailable,
        busyUntilDate: payload.busyUntilDate ? new Date(payload.busyUntilDate) : existingProfile.busyUntilDate,
        updatedAt: new Date()
      }
    });
    
    console.log('Profile updated successfully:', updatedProfile.id);

    // Return properly formatted response matching DeveloperProfile structure
    const updatedProfileData = updatedProfile.data as any;
    const responseData = {
      id: updatedProfile.id,
      data: {
        personalInfo: updatedProfileData.personalInfo || {},
        professionalInfo: updatedProfileData.professionalInfo || {},
        technicalSkills: updatedProfileData.technicalSkills || {},
        stats: updatedProfileData.stats || {},
        projects: updatedProfileData.projects || [],
        recentActivity: updatedProfileData.recentActivity || [],
        achievements: updatedProfileData.achievements || [],
        notifications: updatedProfileData.notifications || [],
        timeEntries: updatedProfileData.timeEntries || [],
      },
      status: updatedProfile.status || "pending",
      isAvailable: updatedProfile.isAvailable || false,
      busyUntilDate: updatedProfile.busyUntilDate || null,
      createdAt: updatedProfile.createdAt.toISOString(),
    };

    return NextResponse.json(responseData, { status: 200, headers: corsHeaders });
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

    const existingProfile = await prisma.developerProfile.findUnique({
      where: { id: developerId }
    });

    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    await prisma.developerProfile.delete({
      where: { id: developerId }
    });
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    console.error("DELETE /api/developer-profiles/[developerId]", err);
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}
