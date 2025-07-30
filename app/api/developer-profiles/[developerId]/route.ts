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

// DELETE /api/developer-profiles/[developerId] - cascade delete profile, assignments, and user
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
) {
  try {
    const { developerId } = await params;

    if (!developerId) {
      return new NextResponse("Developer ID is required", { status: 400, headers: corsHeaders });
    }

    // Use transaction to ensure atomicity of cascade deletion
    await prisma.$transaction(async (prisma) => {
      // Find the developer profile and associated user
      const existingProfile = await prisma.developerProfile.findUnique({
        where: { id: developerId },
        include: {
          user: true,
          assignments: {
            include: {
              project: true
            }
          }
        }
      });

      if (!existingProfile) {
        throw new Error("Profile not found");
      }

      console.log(`Starting cascade deletion for developer: ${developerId}`);
      console.log(`Found ${existingProfile.assignments.length} project assignments to clean up`);

      // Step 1: Remove developer from all project chat participants
      for (const assignment of existingProfile.assignments) {
        try {
          // Find project chat and remove developer as participant
          const projectChat = await prisma.projectChat.findFirst({
            where: { projectId: assignment.projectId }
          });

          if (projectChat) {
            await prisma.chatParticipant.deleteMany({
              where: {
                chatId: projectChat.id,
                userId: existingProfile.userId || developerId
              }
            });
            console.log(`Removed developer from chat for project: ${assignment.projectId}`);
          }
        } catch (chatError) {
          console.warn(`Failed to remove from chat for project ${assignment.projectId}:`, chatError);
          // Continue with deletion even if chat cleanup fails
        }
      }

      // Step 2: Delete all project assignments
      const deletedAssignments = await prisma.projectAssignment.deleteMany({
        where: { developerId: existingProfile.userId || developerId }
      });
      console.log(`Deleted ${deletedAssignments.count} project assignments`);

      // Step 3: Delete the developer profile
      await prisma.developerProfile.delete({
        where: { id: developerId }
      });
      console.log(`Deleted developer profile: ${developerId}`);

      // Step 4: Delete the associated user if it exists
      if (existingProfile.userId) {
        try {
          await prisma.user.delete({
            where: { id: existingProfile.userId }
          });
          console.log(`Deleted associated user: ${existingProfile.userId}`);
        } catch (userDeleteError) {
          console.warn(`Failed to delete user ${existingProfile.userId}:`, userDeleteError);
          // Continue - profile is already deleted
        }
      }

      console.log(`Cascade deletion completed for developer: ${developerId}`);
    });

    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    console.error("DELETE /api/developer-profiles/[developerId]", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return new NextResponse(errorMessage, { status: 500, headers: corsHeaders });
  }
}
