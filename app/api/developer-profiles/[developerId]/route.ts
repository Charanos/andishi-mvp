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
  'Access-Control-Allow-Methods': 'GET, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function for deep merging objects
function deepMerge(target: any, source: any) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
        target[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

// Ensure numeric statistics do not contain null/undefined so that the UI can safely call .toFixed()
function sanitizeProfileData(data: any) {
  if (!data) return {};
  // Ensure stats object exists
  data.stats = data.stats || {};

  // List of numeric stat fields we expect
  const numericStatFields = [
    'averageRating',
    'totalProjects',
    'completedProjects',
    'hoursLogged',
    'totalEarnings', // Used with .toLocaleString() in frontend
  ];

  numericStatFields.forEach((field) => {
    const value = data.stats[field];
    data.stats[field] = typeof value === 'number' && !isNaN(value) ? value : 0;
  });

  return data;
}

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
    let profileData = sanitizeProfileData(profile.data as any);
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
    
    // Sanitize to prevent null/undefined values that break the frontend
    const sanitizedData = sanitizeProfileData(profileData);
    
    console.log('Updating profile with sanitized data:', JSON.stringify(sanitizedData, null, 2));

    const updatedProfile = await prisma.developerProfile.update({
      where: { id: developerId },
      data: {
        data: sanitizedData,
        status: payload.status || existingProfile.status,
        isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : existingProfile.isAvailable,
        busyUntilDate: payload.busyUntilDate ? new Date(payload.busyUntilDate) : existingProfile.busyUntilDate,
        updatedAt: new Date()
      }
    });
    
    console.log('Profile updated successfully:', updatedProfile.id);

    // Return properly formatted response matching DeveloperProfile structure
    const updatedProfileData = sanitizeProfileData(updatedProfile.data as any);
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

// PATCH /api/developer-profiles/[developerId] - partially update profile
export async function PATCH(
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
      where: { id: developerId },
    });

    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    // Deep merge the existing data with the new payload data
    let mergedData = deepMerge(existingProfile.data, payload.data);

    // Sanitize to prevent null/undefined values that break the frontend (e.g., .toFixed on undefined)
    mergedData = sanitizeProfileData(mergedData);

    console.log('--- Developer Profile PATCH ---');
    console.log('Received payload:', JSON.stringify(payload, null, 2));
    console.log('Existing profile data:', JSON.stringify(existingProfile.data, null, 2));
    console.log('Merged and sanitized data for update:', JSON.stringify(mergedData, null, 2));

    const updatedProfile = await prisma.developerProfile.update({
      where: { id: developerId },
      data: {
        data: mergedData,
        status: payload.status,
        isAvailable: payload.isAvailable,
        busyUntilDate: payload.busyUntilDate ? new Date(payload.busyUntilDate) : undefined,
        updatedAt: new Date(),
      },
    });

    console.log('Profile patched successfully:', updatedProfile.id);

    const updatedProfileData = sanitizeProfileData(updatedProfile.data as any);
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
    console.error("PATCH /api/developer-profiles/[developerId]", err);
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
