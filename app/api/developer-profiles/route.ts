import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
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
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    const client = await clientPromise;
    const db = client.db();

    // If an ID is provided, fetch a single profile
    if (id) {
      let objectId: ObjectId;
      try {
        objectId = new ObjectId(id);
      } catch (error) {
        return new NextResponse("Invalid profile ID format", { status: 400 });
      }

      const profile = await db
        .collection('developerProfiles')
        .findOne({ _id: objectId });

      if (!profile) {
        return new NextResponse("Profile not found", { status: 404 });
      }

      // Reconstruct the profile to match the DeveloperProfile interface
      const data = profile.data || {};
      const responseData: DeveloperProfile = {
        id: profile._id.toString(),
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
      };

      return NextResponse.json(responseData);
    }

    // Fetch all profiles
    console.log('Fetching developer profiles from database...');
    const records = await db.collection('developerProfiles').find({}).toArray();
    console.log(`Found ${records.length} developer profiles`);

    const profiles: DeveloperProfile[] = records.map((profile) => {
      const data = profile.data || {};
      return {
        id: profile._id.toString(),
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
      };
    });
    
    return NextResponse.json(profiles, { status: 200 });
  } catch (err) {
    console.error("GET /api/developer-profiles error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
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
    if (!profileData.personalInfo || !profileData.professionalInfo || !profileData.technicalSkills || !profileData.stats) {
      return new NextResponse("Complete profile data is required (personalInfo, professionalInfo, technicalSkills, stats)", { status: 400 });
    }

    // Validate PersonalInfo
    const { firstName, lastName, email, location, tagline } = profileData.personalInfo;
    if (!firstName || !lastName || !email || !location || !tagline) {
      return new NextResponse("Complete personal information is required (firstName, lastName, email, location, tagline)", { status: 400 });
    }

    // Validate ProfessionalInfo
    const { title, experienceLevel, availability, hourlyRate } = profileData.professionalInfo;
    if (!title || !experienceLevel || !availability || typeof hourlyRate !== 'number') {
      return new NextResponse("Complete professional information is required (title, experienceLevel, availability, hourlyRate)", { status: 400 });
    }

    // Validate TechnicalSkills - ensure primarySkills is an array of Skill objects
    if (!Array.isArray(profileData.technicalSkills.primarySkills)) {
      return new NextResponse("Primary skills must be an array", { status: 400 });
    }

    // Validate that primarySkills contain proper Skill objects
    const invalidSkills = profileData.technicalSkills.primarySkills.filter(skill => 
      !skill.name || typeof skill.level !== 'number'
    );
    if (invalidSkills.length > 0) {
      return new NextResponse("Primary skills must be valid Skill objects with name and level properties", { status: 400 });
    }

    // Validate Stats
    const { totalProjects, averageRating, totalEarnings, clientRetention } = profileData.stats;
    if (typeof totalProjects !== 'number' || typeof averageRating !== 'number' || 
        typeof totalEarnings !== 'number' || typeof clientRetention !== 'number') {
      return new NextResponse("Core stats must be numbers (totalProjects, averageRating, totalEarnings, clientRetention)", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Ensure technical skills are properly formatted
    const processedTechnicalSkills = {
      primarySkills: ensureSkillArray(profileData.technicalSkills.primarySkills),
      frameworks: ensureSkillArray(profileData.technicalSkills.frameworks),
      databases: ensureSkillArray(profileData.technicalSkills.databases),
      tools: ensureSkillArray(profileData.technicalSkills.tools),
      cloudPlatforms: profileData.technicalSkills.cloudPlatforms || [],
      specializations: profileData.technicalSkills.specializations || [],
    };

    const newProfile = {
      data: {
        personalInfo: profileData.personalInfo,
        professionalInfo: profileData.professionalInfo,
        technicalSkills: processedTechnicalSkills,
        stats: profileData.stats,
        projects: profileData.projects || [],
        recentActivity: profileData.recentActivity || [],
        achievements: profileData.achievements || [],
        notifications: profileData.notifications || [],
        timeEntries: profileData.timeEntries || [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("developerProfiles").insertOne(newProfile);

    // Return the created profile with proper structure
    const createdProfile: DeveloperProfile = {
      id: result.insertedId.toString(),
      personalInfo: profileData.personalInfo,
      professionalInfo: profileData.professionalInfo,
      technicalSkills: processedTechnicalSkills,
      stats: profileData.stats,
      projects: profileData.projects || [],
      recentActivity: profileData.recentActivity || [],
      achievements: profileData.achievements || [],
      notifications: profileData.notifications || [],
      timeEntries: profileData.timeEntries || [],
    };

    return NextResponse.json(createdProfile, { status: 201 });
  } catch (err) {
    console.error("POST /api/developer-profiles error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
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
      return new NextResponse("Profile ID is required", { status: 400 });
    }

    let profileObjectId: ObjectId;
    try {
      profileObjectId = new ObjectId(profileId);
    } catch (error) {
      console.error("Invalid profileId for ObjectId:", profileId, error);
      return new NextResponse("Invalid profile ID format", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if profile exists
    const existingProfile = await db.collection("developerProfiles").findOne({ _id: profileObjectId });
    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Exclude id field from the data to be saved
    const { id, ...dataToSave } = profileData;

    // Validate the data structure if provided
    if (dataToSave.personalInfo) {
      const { firstName, lastName, email, location, tagline } = dataToSave.personalInfo;
      if (!firstName || !lastName || !email || !location || !tagline) {
        return new NextResponse("Complete personal information is required", { status: 400 });
      }
    }

    if (dataToSave.professionalInfo) {
      const { title, experienceLevel, availability, hourlyRate } = dataToSave.professionalInfo;
      if (!title || !experienceLevel || !availability || typeof hourlyRate !== 'number') {
        return new NextResponse("Complete professional information is required", { status: 400 });
      }
    }

    if (dataToSave.technicalSkills) {
      if (!Array.isArray(dataToSave.technicalSkills.primarySkills)) {
        return new NextResponse("Primary skills must be an array", { status: 400 });
      }
      
      // Validate that primarySkills contain proper Skill objects
      const invalidSkills = dataToSave.technicalSkills.primarySkills.filter((skill: any) => 
        !skill.name || typeof skill.level !== 'number'
      );
      if (invalidSkills.length > 0) {
        return new NextResponse("Primary skills must be valid Skill objects with name and level properties", { status: 400 });
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
        return new NextResponse("Core stats must be numbers", { status: 400 });
      }
    }

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
      console.log(`Profile with _id: ${profileObjectId} not found after update.`);
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Return properly formatted response
    const responseData: DeveloperProfile = {
      id: updatedProfile._id.toString(),
      personalInfo: updatedProfile.data.personalInfo,
      professionalInfo: updatedProfile.data.professionalInfo,
      technicalSkills: constructTechnicalSkills(updatedProfile.data.technicalSkills || {}),
      stats: updatedProfile.data.stats,
      projects: updatedProfile.data.projects || [],
      recentActivity: updatedProfile.data.recentActivity || [],
      achievements: updatedProfile.data.achievements || [],
      notifications: updatedProfile.data.notifications || [],
      timeEntries: updatedProfile.data.timeEntries || [],
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("PUT /api/developer-profiles error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
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
    return new NextResponse("Profile ID is required", { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return new NextResponse("Invalid profile ID format", { status: 400 });
    }

    const deleteResult = await db.collection("developerProfiles").deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // Success - No Content
  } catch (err) {
    console.error(`DELETE /api/developer-profiles?id=${id} error`, err);
    return new NextResponse("Internal Server Error", { status: 500 });
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
      return new NextResponse("Profile ID is required", { status: 400 });
    }

    let profileObjectId: ObjectId;
    try {
      profileObjectId = new ObjectId(id);
    } catch (error) {
      return new NextResponse("Invalid profile ID format", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if profile exists
    const existingProfile = await db.collection("developerProfiles").findOne({ _id: profileObjectId });
    if (!existingProfile) {
      return new NextResponse("Profile not found", { status: 404 });
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

    updateData.updatedAt = new Date();

    const result = await db.collection("developerProfiles").findOneAndUpdate(
      { _id: profileObjectId },
      { $set: updateData },
      { returnDocument: "after" }
    );

    const updatedProfile = result?.value;
    if (!updatedProfile) {
      return new NextResponse("Failed to update profile", { status: 500 });
    }

    // Return properly formatted response
    const responseData: DeveloperProfile = {
      id: updatedProfile._id.toString(),
      personalInfo: updatedProfile.data.personalInfo,
      professionalInfo: updatedProfile.data.professionalInfo,
      technicalSkills: constructTechnicalSkills(updatedProfile.data.technicalSkills || {}),
      stats: updatedProfile.data.stats,
      projects: updatedProfile.data.projects || [],
      recentActivity: updatedProfile.data.recentActivity || [],
      achievements: updatedProfile.data.achievements || [],
      notifications: updatedProfile.data.notifications || [],
      timeEntries: updatedProfile.data.timeEntries || [],
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("PATCH /api/developer-profiles error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Fallback for unsupported methods
export function OPTIONS(): NextResponse {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Allow': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}