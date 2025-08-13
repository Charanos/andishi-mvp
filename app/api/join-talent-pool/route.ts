// MongoDB imports removed
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// GET handler to fetch all developer submissions
export async function GET() {
  try {
    // Fetch developers using Prisma
    const developers = await prisma.developer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return new NextResponse(JSON.stringify({ success: true, developers }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching developers:', error);
    return new NextResponse(JSON.stringify({ success: false, message: 'Failed to fetch developers', error: error instanceof Error ? error.message : error }), { status: 500, headers: corsHeaders });
  }
}

// POST handler to add a developer to the talent pool
export async function POST(req: NextRequest) {
  try {
    // Validate environment variables first
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found in environment');
      return new NextResponse(JSON.stringify({ 
        success: false, 
        message: 'Server configuration error - DATABASE_URL missing' 
      }), { status: 500, headers: corsHeaders });
    }

    console.log('Environment variables validated successfully');
    
    const data = await req.json();
    data.createdAt = new Date();
    // Prisma code handles developer creation

    // 1) Create developer record
    const developer = await prisma.developer.create({
      data: {
        email: data.email || '',
        firstName: data.firstName || data.personalInfo?.firstName || '',
        lastName: data.lastName || data.personalInfo?.lastName || '',
        personalInfo: data.personalInfo || {},
        professionalInfo: data.professionalInfo || {},
        technicalSkills: data.technicalSkills || {},
        workExperience: data.workExperience || [],
        projects: data.projects || [],
        cvUrl: data.cvUrl || null,
        createdAt: data.createdAt
      }
    });

    // 2) Create or update user using Prisma (this ensures proper relations)
    const emailLower = (data.email || '').toLowerCase().trim();
    const firstName = data.firstName || data.personalInfo?.firstName || '';
    const lastName = data.lastName || data.personalInfo?.lastName || '';
    
    let user;
    try {
      // Try to find existing user first
      user = await prisma.user.findUnique({ where: { email: emailLower } });
      
      if (user) {
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName,
            lastName,
            role: 'developer',
            isActive: true,
            updatedAt: new Date(),
          },
        });
        console.log('Updated existing user:', user.id);
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: emailLower,
            firstName,
            lastName,
            role: 'developer',
            status: 'pending',
            developerProfileStatus: 'pending',
            isActive: true,
            accountCreated: false,
            passwordGenerated: false,
            projectCount: 0,
            progress: 0,
          },
        });
        console.log('Created new user:', user.id);
      }
    } catch (userError) {
      console.error('Error creating/updating user:', userError);
      throw userError;
    }

    // 3) Create developer profile using Prisma (this ensures proper relations)
    try {
      // Check if developer profile already exists
      const existingProfile = await prisma.developerProfile.findUnique({
        where: { userId: user.id },
      });
      
      if (existingProfile) {
        // Update existing profile
        await prisma.developerProfile.update({
          where: { id: existingProfile.id },
          data: {
            data: {
              personalInfo: data.personalInfo || {},
              professionalInfo: data.professionalInfo || {},
              technicalSkills: data.technicalSkills || {},
              workExperience: data.workExperience || [],
              projects: data.projects || [],
              cvUrl: data.cvUrl || null,
              stats: {
                totalProjects: 0,
                averageRating: 0,
                totalEarnings: 0,
                clientRetention: 0,
              },
            },
            status: "pending",
            isAvailable: false,
            updatedAt: new Date(),
          },
        });
        console.log('Updated existing developer profile for user:', user.id);
      } else {
        // Create new profile
        await prisma.developerProfile.create({
          data: {
            userId: user.id,
            status: "pending",
            isAvailable: false,
            data: {
              personalInfo: data.personalInfo || {},
              professionalInfo: data.professionalInfo || {},
              technicalSkills: data.technicalSkills || {},
              workExperience: data.workExperience || [],
              projects: data.projects || [],
              cvUrl: data.cvUrl || null,
              stats: {
                totalProjects: 0,
                averageRating: 0,
                totalEarnings: 0,
                clientRetention: 0,
              },
            },
          },
        });
        console.log('Created new developer profile for user:', user.id);
      }
    } catch (profileErr: any) {
      console.error('Error creating/updating developer profile:', profileErr);
      throw profileErr;
    }

    // MongoDB backward compatibility removed, handled by Prisma

    return new NextResponse(JSON.stringify({ success: true, insertedId: developer.id }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error adding developer:', error);
    return new NextResponse(JSON.stringify({ success: false, message: 'Failed to add developer', error: error instanceof Error ? error.message : error }), { status: 500, headers: corsHeaders });
  }
}

// DELETE handler to remove a developer by _id
export async function DELETE(req: NextRequest) {
  try {
    const { _id } = await req.json();
    if (!(_id && typeof _id === 'string')) {
      return new NextResponse(JSON.stringify({ success: false, message: 'Missing or invalid _id' }), { status: 400, headers: corsHeaders });
    }
    // Delete developer using Prisma
    const result = await prisma.developer.delete({
      where: { id: _id }
    });
    return new NextResponse(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting developer:', error);
    return new NextResponse(JSON.stringify({ success: false, message: 'Failed to delete developer', error: error instanceof Error ? error.message : error }), { status: 500, headers: corsHeaders });
  }
}

// PUT handler to update a developer by _id
export async function PUT(req: NextRequest) {
  try {
    const { _id, ...updateData } = await req.json();
    if (!(_id && typeof _id === 'string')) {
      return new NextResponse(JSON.stringify({ success: false, message: 'Missing or invalid _id' }), { status: 400, headers: corsHeaders });
    }
    
    // Ensure cvUrl is properly handled
    if (updateData.data && updateData.data.cvUrl !== undefined) {
      updateData.cvUrl = updateData.data.cvUrl;
      delete updateData.data.cvUrl;
    }
    
    // Update developer using Prisma
    const result = await prisma.developer.update({
      where: { id: _id },
      data: updateData
    });
    return new NextResponse(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error updating developer:', error);
    return new NextResponse(JSON.stringify({ success: false, message: 'Failed to update developer', error: error instanceof Error ? error.message : error }), { status: 500, headers: corsHeaders });
  }
}
