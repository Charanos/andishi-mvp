import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { DeveloperProfile } from "@/types/developer-profile";
import { mockDeveloperProfile } from "../../../lib/mockDeveloperProfile";

const prisma = new PrismaClient();

// Type for the database record
interface DeveloperProfileRecord {
  id: string;
  data: any; // Changed from Partial<DeveloperProfile> to any for better JSON handling
}

// NOTE: Proper authentication / RBAC is not yet wired. For now, we only allow writes
// if NODE_ENV is not production. Replace this with real admin checks later.
const isReadOnly = process.env.NODE_ENV === "production";

export async function GET(): Promise<NextResponse> {
  try {
    console.log('Fetching developer profiles from database...');
    let records = await prisma.developerProfile.findMany() as DeveloperProfileRecord[];
    console.log(`Found ${records.length} developer profiles`);

    // Only create mock profile if no records exist at all
    if (records.length === 0) {
      console.log('No profiles found, creating mock profile...');
      const created = await prisma.developerProfile.create({
        data: {
          data: mockDeveloperProfile,
        },
      }) as DeveloperProfileRecord;
      records = [created];
    }

    const payload: DeveloperProfile[] = records.map(rec => {
      // Parse the data if it's a string (some databases store JSON as strings)
      let data = rec.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.warn('Failed to parse JSON data for record:', rec.id);
          data = {};
        }
      }

      // Provide more robust fallbacks
      const personalInfo = data?.personalInfo || {};
      const professionalInfo = data?.professionalInfo || {};
      const technicalSkills = data?.technicalSkills || {};
      const stats = data?.stats || {};

      return {
        id: rec.id,
        personalInfo: {
          firstName: personalInfo.firstName || 'Unknown', 
          lastName: personalInfo.lastName || 'Developer',
          email: personalInfo.email || '',
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
    });
    
    console.log('Sending response with payload:', JSON.stringify(payload, null, 2));
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("GET /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (isReadOnly) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const payload = await req.json();
    console.log('Received PUT payload:', payload);

    const existing = await prisma.developerProfile.findFirst();

    let record;
    if (existing) {
      console.log('Updating existing profile:', existing.id);
      record = await prisma.developerProfile.update({
        where: { id: existing.id },
        data: { data: payload },
      });
    } else {
      console.log('Creating new profile');
      record = await prisma.developerProfile.create({
        data: { data: payload },
      });
    }

    console.log('Profile saved successfully');
    return NextResponse.json(record.data, { status: 200 });
  } catch (err) {
    console.error("PUT /api/developer-profile error", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Fallback for unsupported methods
export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}