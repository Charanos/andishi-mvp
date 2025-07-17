import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  DeveloperProfile,
  PersonalInfo,
  ProfessionalInfo,
  TechnicalSkills,
  Stats,
  Skill,
  Project,
  Achievement,
  RecentActivity,
  Notification,
  TimeEntry
} from "@/lib/types";

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

type DeveloperProfileData = {
  personalInfo: PersonalInfo;
  professionalInfo: ProfessionalInfo;
  technicalSkills: TechnicalSkills;
  stats: Stats;
  projects?: Project[];
  recentActivity?: RecentActivity[];
  achievements?: Achievement[];
  notifications?: Notification[];
  timeEntries?: TimeEntry[];
};

/**
 * Helper function to ensure skills are properly formatted as Skill objects
 */
function ensureSkillArray(skills: any): Skill[] {
  if (!Array.isArray(skills)) return [];

  return skills.map(skill => {
    if (typeof skill === 'string') {
      return { name: skill, level: 0 };
    }
    return {
      name: skill.name || '',
      level: skill.level || 0,
      category: skill.category,
      trending: skill.trending,
      endorsements: skill.endorsements,
      lastUsed: skill.lastUsed,
    };
  });
}

/**
 * Helper function to construct technical skills with proper validation
 */
function constructTechnicalSkills(data: any): TechnicalSkills {
  return {
    primarySkills: ensureSkillArray(data.primarySkills) || [
      { name: 'JavaScript', level: 80 },
      { name: 'React', level: 75 },
      { name: 'Node.js', level: 70 },
    ],
    frameworks: ensureSkillArray(data.frameworks),
    databases: ensureSkillArray(data.databases),
    tools: ensureSkillArray(data.tools),
    cloudPlatforms: Array.isArray(data.cloudPlatforms) ? data.cloudPlatforms : [],
    specializations: Array.isArray(data.specializations) ? data.specializations : [],
  };
}

/**
 * GET /api/developer-profiles
 * Fetch all developer profiles or a single profile by ID
 * Special endpoint: ?action=sync to synchronize data
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action');

  // Handle synchronization action
  if (action === 'sync') {
    try {
      // Logic to synchronize data between Developer Profiles and Users collections

      // Default profile data for new profiles
      const defaultProfileData = {
        status: 'pending',
        isAvailable: false,
        createdAt: new Date(),
        data: {
          personalInfo: {
            firstName: 'Unknown',
            lastName: 'Developer',
            email: '',
            location: 'Unknown',
            tagline: 'Full Stack Developer'
          },
          professionalInfo: {
            title: 'Developer',
            experienceLevel: 'Mid-level',
            availability: 'Full-time',
            hourlyRate: 50,
            languages: [],
            certifications: [],
            preferredWorkType: []
          },
          technicalSkills: {
            primarySkills: [
              { name: 'JavaScript', level: 0 },
              { name: 'React', level: 0 },
              { name: 'Node.js', level: 0 }
            ],
            frameworks: [],
            databases: [],
            tools: [],
            cloudPlatforms: [],
            specializations: []
          },
          stats: {
            totalProjects: 0,
            completedProjects: 0,
            totalEarnings: 0,
            averageRating: 0,
            totalCodeLines: 0,
            activeDays: 0,
            clientRetention: 0,
            totalCommits: 0,
            bugsFixed: 0,
            codeReviewsGiven: 0,
            mentoringSessions: 0
          },
          projects: [],
          recentActivity: [],
          achievements: [],
          notifications: [],
          timeEntries: []
        }
      };

      // Ensure every user with role 'developer' has a corresponding developer profile
      // But only if they don't have a rejected status (to avoid recreating deleted profiles)
      const users = await prisma.user.findMany({
        where: {
          role: 'developer',
          developerProfileStatus: { not: 'rejected' } // Don't recreate profiles for rejected users
        }
      });
      let profilesCreated = 0;

      for (const user of users) {
        const profileExists = await prisma.developerProfile.findUnique({ where: { userId: user.id } });
        if (!profileExists && user.developerProfileStatus !== 'rejected') {
          // Insert a default developer profile for the user
          await prisma.developerProfile.create({
            data: {
              userId: user.id,
              ...defaultProfileData,
              data: {
                ...defaultProfileData.data,
                personalInfo: {
                  ...defaultProfileData.data.personalInfo,
                  firstName: user.firstName || 'Unknown',
                  lastName: user.lastName || 'Developer',
                  email: user.email || ''
                }
              }
            }
          });
          profilesCreated++;
        }
      }

      return NextResponse.json({
        message: `Synchronization complete. Created ${profilesCreated} new profiles.`,
        profilesCreated,
        totalUsers: users.length
      });
    } catch (error: any) {
      
      return NextResponse.json({ error: 'Synchronization failed', details: error.message }, { status: 500 });
    }
  }

  try {
    // If an ID is provided, fetch a single profile
    if (id) {
      const profile = await prisma.developerProfile.findUnique({ 
        where: { id },
        include: { user: true }
      });

      if (!profile) {
        return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
      }

      // Reconstruct the profile to match the DeveloperProfile interface
      const data = (profile.data as any) || {};
      const responseData: DeveloperProfile = {
        id: profile.id,
        data: {
          personalInfo: {
            firstName: data.personalInfo?.firstName || 'Unknown',
            lastName: data.personalInfo?.lastName || 'Developer',
            email: data.personalInfo?.email || '',
            phone: data.personalInfo?.phone,
            location: data.personalInfo?.location || 'Unknown',
            timeZone: data.personalInfo?.timeZone,
            linkedin: data.personalInfo?.linkedin,
            github: data.personalInfo?.github,
            portfolio: data.personalInfo?.portfolio,
            tagline: data.personalInfo?.tagline || 'Full Stack Developer',
            bio: data.personalInfo?.bio,
          },
          professionalInfo: {
            title: data.professionalInfo?.title || 'Developer',
            experienceLevel: data.professionalInfo?.experienceLevel || 'Mid-level',
            yearsOfExperience: data.professionalInfo?.yearsOfExperience,
            availability: data.professionalInfo?.availability || 'Full-time',
            hourlyRate: Number(data.professionalInfo?.hourlyRate) || 50,
            bio: data.professionalInfo?.bio,
            languages: data.professionalInfo?.languages || [],
            certifications: data.professionalInfo?.certifications || [],
            preferredWorkType: data.professionalInfo?.preferredWorkType || [],
            workingHours: data.professionalInfo?.workingHours,
          },
          technicalSkills: constructTechnicalSkills(data.technicalSkills || {}),
          stats: {
            totalProjects: Number(data.stats?.totalProjects) || 0,
            completedProjects: Number(data.stats?.completedProjects) || 0,
            totalEarnings: Number(data.stats?.totalEarnings) || 0,
            averageRating: Number(data.stats?.averageRating) || 0,
            totalCodeLines: Number(data.stats?.totalCodeLines) || 0,
            activeDays: Number(data.stats?.activeDays) || 0,
            clientRetention: Number(data.stats?.clientRetention) || 0,
            responseTime: data.stats?.responseTime,
            totalCommits: Number(data.stats?.totalCommits) || 0,
            bugsFixed: Number(data.stats?.bugsFixed) || 0,
            codeReviewsGiven: Number(data.stats?.codeReviewsGiven) || 0,
            mentoringSessions: Number(data.stats?.mentoringSessions) || 0,
          },
          projects: Array.isArray(data.projects) ? data.projects : [],
          recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
          notifications: Array.isArray(data.notifications) ? data.notifications : [],
          timeEntries: Array.isArray(data.timeEntries) ? data.timeEntries : [],
        },
        status: (profile.status || 'pending') as 'pending' | 'rejected' | 'approved',
        isAvailable: profile.isAvailable ?? data.isAvailable ?? false,
        createdAt: profile.createdAt?.toISOString() || new Date().toISOString(),
      };

      return NextResponse.json(responseData, { status: 200, headers: corsHeaders });
    }

    // Fetch all profiles
    
    const records = await prisma.developerProfile.findMany({ include: { user: true } });
    

    // Debug: Log the first few records to see their structure
    if (records.length > 0) {
      
    }

    const profiles: DeveloperProfile[] = records.map((profile) => {
      const data = (profile.data as any) || {};
      return {
        id: profile.id,
        data: {
          personalInfo: {
            firstName: data.personalInfo?.firstName || 'Unknown',
            lastName: data.personalInfo?.lastName || 'Developer',
            email: data.personalInfo?.email || '',
            phone: data.personalInfo?.phone,
            location: data.personalInfo?.location || 'Unknown',
            timeZone: data.personalInfo?.timeZone,
            linkedin: data.personalInfo?.linkedin,
            github: data.personalInfo?.github,
            portfolio: data.personalInfo?.portfolio,
            tagline: data.personalInfo?.tagline || 'Full Stack Developer',
            bio: data.personalInfo?.bio,
          },
          professionalInfo: {
            title: data.professionalInfo?.title || 'Developer',
            experienceLevel: data.professionalInfo?.experienceLevel || 'Mid-level',
            yearsOfExperience: data.professionalInfo?.yearsOfExperience,
            availability: data.professionalInfo?.availability || 'Full-time',
            hourlyRate: Number(data.professionalInfo?.hourlyRate) || 50,
            bio: data.professionalInfo?.bio,
            languages: data.professionalInfo?.languages || [],
            certifications: data.professionalInfo?.certifications || [],
            preferredWorkType: data.professionalInfo?.preferredWorkType || [],
            workingHours: data.professionalInfo?.workingHours,
          },
          technicalSkills: constructTechnicalSkills(data.technicalSkills || {}),
          stats: {
            totalProjects: Number(data.stats?.totalProjects) || 0,
            completedProjects: Number(data.stats?.completedProjects) || 0,
            totalEarnings: Number(data.stats?.totalEarnings) || 0,
            averageRating: Number(data.stats?.averageRating) || 0,
            totalCodeLines: Number(data.stats?.totalCodeLines) || 0,
            activeDays: Number(data.stats?.activeDays) || 0,
            clientRetention: Number(data.stats?.clientRetention) || 0,
            responseTime: data.stats?.responseTime,
            totalCommits: Number(data.stats?.totalCommits) || 0,
            bugsFixed: Number(data.stats?.bugsFixed) || 0,
            codeReviewsGiven: Number(data.stats?.codeReviewsGiven) || 0,
            mentoringSessions: Number(data.stats?.mentoringSessions) || 0,
          },
          projects: Array.isArray(data.projects) ? data.projects : [],
          recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
          notifications: Array.isArray(data.notifications) ? data.notifications : [],
          timeEntries: Array.isArray(data.timeEntries) ? data.timeEntries : [],
        },
        status: (profile.status || 'pending') as 'pending' | 'rejected' | 'approved',
        isAvailable: profile.isAvailable ?? data.isAvailable ?? false,
        createdAt: profile.createdAt?.toISOString() || new Date().toISOString(),
      };
    });

    return NextResponse.json(profiles, { status: 200, headers: corsHeaders });
  } catch (err) {
    
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

/**
 * POST /api/developer-profiles
 * Create a new developer profile
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const profileData = body as DeveloperProfile;

    // Validate required fields
    if (!profileData.data || !profileData.data.personalInfo || !profileData.data.professionalInfo || !profileData.data.technicalSkills || !profileData.data.stats) {
      return new NextResponse("Complete profile data is required (personalInfo, professionalInfo, technicalSkills, stats)", { status: 400, headers: corsHeaders });
    }

    // Validate PersonalInfo
    const { firstName, lastName, email, location, tagline } = profileData.data.personalInfo;
    if (!firstName || !lastName || !email || !location || !tagline) {
      return new NextResponse("Complete personal information is required (firstName, lastName, email, location, tagline)", { status: 400, headers: corsHeaders });
    }

    // Validate ProfessionalInfo
    const { title, experienceLevel, availability, hourlyRate } = profileData.data.professionalInfo;
    if (!title || !experienceLevel || !availability || typeof hourlyRate !== 'number') {
      return new NextResponse("Complete professional information is required (title, experienceLevel, availability, hourlyRate)", { status: 400, headers: corsHeaders });
    }

    // Validate TechnicalSkills - ensure primarySkills is an array of Skill objects
    if (!Array.isArray(profileData.data.technicalSkills.primarySkills)) {
      return new NextResponse("Primary skills must be an array", { status: 400, headers: corsHeaders });
    }

    // Validate that primarySkills contain proper Skill objects
    const invalidSkills = profileData.data.technicalSkills.primarySkills.filter(skill =>
      !skill.name || typeof skill.level !== 'number'
    );
    if (invalidSkills.length > 0) {
      return new NextResponse("Primary skills must be valid Skill objects with name and level properties", { status: 400, headers: corsHeaders });
    }

    // Validate Stats
    const { totalProjects, averageRating, totalEarnings, clientRetention } = profileData.data.stats;
    if (typeof totalProjects !== 'number' || typeof averageRating !== 'number' ||
      typeof totalEarnings !== 'number' || typeof clientRetention !== 'number') {
      return new NextResponse("Core stats must be numbers (totalProjects, averageRating, totalEarnings, clientRetention)", { status: 400, headers: corsHeaders });
    }

    // Ensure technical skills are properly formatted
    const processedTechnicalSkills = {
      primarySkills: ensureSkillArray(profileData.data.technicalSkills.primarySkills),
      frameworks: ensureSkillArray(profileData.data.technicalSkills.frameworks),
      databases: ensureSkillArray(profileData.data.technicalSkills.databases),
      tools: ensureSkillArray(profileData.data.technicalSkills.tools),
      cloudPlatforms: profileData.data.technicalSkills.cloudPlatforms || [],
      specializations: profileData.data.technicalSkills.specializations || [],
    };

    const result = await prisma.developerProfile.create({
      data: {
        data: {
          personalInfo: profileData.data.personalInfo,
          professionalInfo: profileData.data.professionalInfo,
          technicalSkills: processedTechnicalSkills,
          stats: profileData.data.stats,
          projects: profileData.data.projects || [],
          recentActivity: profileData.data.recentActivity || [],
          achievements: profileData.data.achievements || [],
          notifications: profileData.data.notifications || [],
          timeEntries: profileData.data.timeEntries || [],
        } as any,
        status: profileData.status || "pending",
        isAvailable: profileData.isAvailable || false,
      }
    });

    // Return the created profile with proper structure
    const createdProfile: DeveloperProfile = {
      id: result.id,
      data: result.data as any,
status: result.status as 'pending' | 'rejected' | 'approved',
      isAvailable: result.isAvailable,
      createdAt: result.createdAt.toISOString(),
    };

    return NextResponse.json(createdProfile, { status: 201, headers: corsHeaders });
  } catch (err) {
    
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

/**
 * PUT /api/developer-profiles
 * Update an existing developer profile
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const profileData = await req.json();
    const profileId = profileData?.id;

    if (!profileId) {
      return new NextResponse("Profile ID is required", { status: 400, headers: corsHeaders });
    }

    // Check if profile exists
    const existingProfile = await prisma.developerProfile.findUnique({ where: { id: profileId } });
    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    // Exclude id field from the data to be saved
    const { id, ...dataToSave } = profileData;

    // Validate the data structure if provided
    if (dataToSave.personalInfo) {
      const { firstName, lastName, email, location, tagline } = dataToSave.personalInfo;
      if (!firstName || !lastName || !email || !location || !tagline) {
        return new NextResponse("Complete personal information is required", { status: 400, headers: corsHeaders });
      }
    }

    if (dataToSave.professionalInfo) {
      const { title, experienceLevel, availability, hourlyRate } = dataToSave.professionalInfo;
      if (!title || !experienceLevel || !availability || typeof hourlyRate !== 'number') {
        return new NextResponse("Complete professional information is required", { status: 400, headers: corsHeaders });
      }
    }

    if (dataToSave.technicalSkills) {
      if (!Array.isArray(dataToSave.technicalSkills.primarySkills)) {
        return new NextResponse("Primary skills must be an array", { status: 400, headers: corsHeaders });
      }

      // Validate that primarySkills contain proper Skill objects
      const invalidSkills = dataToSave.technicalSkills.primarySkills.filter((skill: any) =>
        !skill.name || typeof skill.level !== 'number'
      );
      if (invalidSkills.length > 0) {
        return new NextResponse("Primary skills must be valid Skill objects with name and level properties", { status: 400, headers: corsHeaders });
      }

      // Process technical skills to ensure proper format
      dataToSave.technicalSkills = {
        primarySkills: ensureSkillArray(dataToSave.technicalSkills.primarySkills),
        frameworks: ensureSkillArray(dataToSave.technicalSkills.frameworks),
        databases: ensureSkillArray(dataToSave.technicalSkills.databases),
        tools: ensureSkillArray(dataToSave.technicalSkills.tools),
        cloudPlatforms: dataToSave.technicalSkills.cloudPlatforms || [],
        specializations: dataToSave.technicalSkills.specializations || [],
      };
    }

    if (dataToSave.stats) {
      const { totalProjects, averageRating, totalEarnings, clientRetention } = dataToSave.stats;
      if (typeof totalProjects !== 'number' || typeof averageRating !== 'number' ||
        typeof totalEarnings !== 'number' || typeof clientRetention !== 'number') {
        return new NextResponse("Core stats must be numbers", { status: 400, headers: corsHeaders });
      }
    }

    

    // Process technical skills to ensure proper format
    const processedSkills = {
      primarySkills: ensureSkillArray(dataToSave.technicalSkills.primarySkills),
      frameworks: ensureSkillArray(dataToSave.technicalSkills.frameworks),
      databases: ensureSkillArray(dataToSave.technicalSkills.databases),
      tools: ensureSkillArray(dataToSave.technicalSkills.tools),
      cloudPlatforms: dataToSave.technicalSkills.cloudPlatforms || [],
      specializations: dataToSave.technicalSkills.specializations || [],
    };

    const updatedProfile = await prisma.developerProfile.update({
      where: { id: profileId },
      data: {
        data: {
          personalInfo: dataToSave.personalInfo,
          professionalInfo: dataToSave.professionalInfo,
          technicalSkills: processedSkills,
          stats: dataToSave.stats,
          projects: dataToSave.projects || [],
          recentActivity: dataToSave.recentActivity || [],
          achievements: dataToSave.achievements || [],
          notifications: dataToSave.notifications || [],
          timeEntries: dataToSave.timeEntries || [],
        } as any,
        updatedAt: new Date(),
      }
    });

    if (!updatedProfile) {
      return new NextResponse("Failed to update profile", { status: 500, headers: corsHeaders });
    }

    // Return properly formatted response
    const responseData: DeveloperProfile = {
      id: updatedProfile.id,
      data: updatedProfile.data as any,
      status: updatedProfile.status as 'pending' | 'rejected' | 'approved',
      isAvailable: updatedProfile.isAvailable,
    };

    return NextResponse.json(responseData, { status: 200, headers: corsHeaders });
  } catch (err) {
    
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

/**
 * DELETE /api/developer-profiles?id=<profile_id>
 * Delete a developer profile
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Profile ID is required", { status: 400, headers: corsHeaders });
  }

  try {
    // First, get the profile to find the associated user
    const profileToDelete = await prisma.developerProfile.findUnique({ 
      where: { id },
      include: { user: true }
    });

    if (!profileToDelete) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    // Delete the profile
    await prisma.developerProfile.delete({ where: { id } });

    // Mark the associated user as rejected to prevent profile recreation
    if (profileToDelete.userId) {
      await prisma.user.update({
        where: { id: profileToDelete.userId },
        data: {
          developerProfileStatus: "rejected",
          status: "inactive",
          isActive: false,
          updatedAt: new Date()
        }
      });
    }

    return new NextResponse(null, { status: 204, headers: corsHeaders }); // Success - No Content
  } catch (err) {
    
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

/**
 * PATCH /api/developer-profiles
 * Partially update a developer profile
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return new NextResponse("Profile ID is required", { status: 400, headers: corsHeaders });
    }

    // Check if profile exists
    const existingProfile = await prisma.developerProfile.findUnique({ where: { id } });
    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404, headers: corsHeaders });
    }

    // Build update object for nested fields
    const updateData: any = {};

    if (updates.personalInfo) {
      Object.keys(updates.personalInfo).forEach(key => {
        updateData[`data.personalInfo.${key}`] = updates.personalInfo[key];
      });
    }

    if (updates.professionalInfo) {
      Object.keys(updates.professionalInfo).forEach(key => {
        updateData[`data.professionalInfo.${key}`] = updates.professionalInfo[key];
      });
    }

    if (updates.technicalSkills) {
      // Process technical skills to ensure proper format
      const processedSkills = {
        primarySkills: updates.technicalSkills.primarySkills ? ensureSkillArray(updates.technicalSkills.primarySkills) : undefined,
        frameworks: updates.technicalSkills.frameworks ? ensureSkillArray(updates.technicalSkills.frameworks) : undefined,
        databases: updates.technicalSkills.databases ? ensureSkillArray(updates.technicalSkills.databases) : undefined,
        tools: updates.technicalSkills.tools ? ensureSkillArray(updates.technicalSkills.tools) : undefined,
        cloudPlatforms: updates.technicalSkills.cloudPlatforms,
        specializations: updates.technicalSkills.specializations,
      };

      Object.keys(processedSkills).forEach(key => {
        if (processedSkills[key as keyof typeof processedSkills] !== undefined) {
          updateData[`data.technicalSkills.${key}`] = processedSkills[key as keyof typeof processedSkills];
        }
      });
    }

    if (updates.stats) {
      Object.keys(updates.stats).forEach(key => {
        updateData[`data.stats.${key}`] = updates.stats[key];
      });
    }

    // Handle array fields
    if (updates.projects) updateData['data.projects'] = updates.projects;
    if (updates.recentActivity) updateData['data.recentActivity'] = updates.recentActivity;
    if (updates.achievements) updateData['data.achievements'] = updates.achievements;
    if (updates.notifications) updateData['data.notifications'] = updates.notifications;
    if (updates.timeEntries) updateData['data.timeEntries'] = updates.timeEntries;
    
    // Handle availability updates
    if (updates.updateAvailability) {
      const isAvailable = updates.updateAvailability === 'available';
      updateData.isAvailable = isAvailable;
      console.log(`Updating developer availability to: ${isAvailable ? 'available' : 'busy'}`);
    }
    
    // Handle direct availability setting
    if (updates.isAvailable !== undefined) {
      updateData.isAvailable = updates.isAvailable;
      console.log(`Setting developer availability to: ${updates.isAvailable ? 'available' : 'busy'}`);
    }
    
    if (updates.busyUntilDate !== undefined) {
      updateData.busyUntilDate = updates.busyUntilDate;
    }

    updateData.updatedAt = new Date();

    const updatedProfile = await prisma.developerProfile.update({
      where: { id },
      data: updateData,
    });

    // Return properly formatted response
    const responseData: DeveloperProfile = {
      id: updatedProfile.id,
      data: updatedProfile.data as any,
      status: (updatedProfile.status || 'pending') as 'pending' | 'rejected' | 'approved',
      isAvailable: updatedProfile.isAvailable || false,
    };

    return NextResponse.json(responseData, { status: 200, headers: corsHeaders });
  } catch (err) {
    
    return new NextResponse("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

// Fallback for unsupported methods
export function OPTIONS(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}