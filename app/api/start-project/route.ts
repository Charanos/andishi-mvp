import { z } from 'zod';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { startProjectFormSchema, authenticatedStartProjectFormSchema } from '@/lib/formSchema';


// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://andishi.dev' : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// Type for the parsed data from the form schemas
type ParsedData = z.infer<typeof startProjectFormSchema> | z.infer<typeof authenticatedStartProjectFormSchema>;

// GET handler to fetch all project submissions
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json({ success: true, projects }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch projects', error: error instanceof Error ? error.message : error }, { headers: corsHeaders });
  }
}

// DELETE handler to remove a project by id
export async function DELETE(req: NextRequest) {
  try {
    const { id, _id } = await req.json();
    const projectId = id || _id;
    if (!(projectId && typeof projectId === 'string')) {
      return NextResponse.json({ success: false, message: 'Missing or invalid project id' }, { status: 400, headers: corsHeaders });
    }
    
    const result = await prisma.project.delete({ 
      where: { id: projectId } 
    });
    
    if (result) {
      return NextResponse.json({ success: true, message: 'Project deleted' }, { headers: corsHeaders });
    } else {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404, headers: corsHeaders });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete project', error: error instanceof Error ? error.message : error }, { headers: corsHeaders });
  }
}

// PATCH handler to update project status
export async function PATCH(req: NextRequest) {
  try {
    const { id, _id, status } = await req.json();
    const projectId = id || _id;
    if (!(projectId && typeof projectId === 'string')) {
      return NextResponse.json({ success: false, message: 'Missing or invalid project id' }, { status: 400, headers: corsHeaders });
    }
    const allowedStatuses = ['pending', 'reviewed', 'approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status value' }, { status: 400, headers: corsHeaders });
    }
    
    const result = await prisma.project.update({
      where: { id: projectId },
      data: { status }
    });
    
    if (result) {
      return NextResponse.json({ success: true, message: 'Project status updated' }, { headers: corsHeaders });
    } else {
      return NextResponse.json({ success: false, message: 'Project not found or status unchanged' }, { status: 404, headers: corsHeaders });
    }
  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json({ success: false, message: 'Failed to update status', error: error instanceof Error ? error.message : error }, { headers: corsHeaders });
  }
}

// This handler receives form submissions from the Start Project form
export async function POST(req: NextRequest) {
  try {
    // Validate environment variables first
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found in environment');
      return NextResponse.json({ 
        success: false, 
        message: 'Server configuration error - DATABASE_URL missing' 
      }, { status: 500, headers: corsHeaders });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment');
      return NextResponse.json({ 
        success: false, 
        message: 'Server configuration error - JWT_SECRET missing' 
      }, { status: 500, headers: corsHeaders });
    }

    console.log('Environment variables validated successfully');
    
    const data = await req.json();
    console.log('Received data:', data);

    // Check if this is an authenticated submission (has userId)
    const isAuthenticated = !!(data.userId && typeof data.userId === 'string');
    console.log('Is authenticated:', isAuthenticated);

    let parsed;
    let userId;
    let existingUser = null;
    let userInfo: any = null;


    if (isAuthenticated) {
      // For authenticated submissions, validate the project data structure
      const projectData = {
        projectDetails: {
          ...data.projectDetails,
          techStack: data.projectDetails?.techStack || [],
          priority: data.projectDetails?.priority || "low"
        },
        pricing: {
          ...data.pricing,
          type: data.pricing?.type || "fixed",
          currency: data.pricing?.currency || "USD",
          milestones: data.pricing?.milestones || []
        }
      };

      console.log('Validating authenticated project data:', projectData);

      // Use the authenticated schema for validation
      const validationResult = authenticatedStartProjectFormSchema.safeParse(projectData);
      if (!validationResult.success) {
        const errors = validationResult.error.format();
        console.error("Authenticated validation errors:", errors);
        return NextResponse.json({
          success: false,
          message: 'Validation failed',
          errors
        }, { status: 400, headers: corsHeaders });
      }
      parsed = validationResult;

      // Validate userId
      userId = data.userId;
      if (!userId || typeof userId !== 'string') {
        return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400, headers: corsHeaders });
      }

      // Get user information for the authenticated user
      existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404, headers: corsHeaders });
      }
    } else {
      // For unauthenticated submissions, validate the full form including user info
      const fullData = {
        userInfo: {
          ...data.userInfo,
          role: data.userInfo?.role || "client"
        },
        projectDetails: {
          ...data.projectDetails,
          techStack: data.projectDetails?.techStack || [],
          priority: data.projectDetails?.priority || "low"
        },
        pricing: {
          ...data.pricing,
          type: data.pricing?.type || "fixed",
          currency: data.pricing?.currency || "USD",
          milestones: data.pricing?.milestones || []
        }
      };

      console.log('Validating unauthenticated full data:', fullData);

      const validationResult = startProjectFormSchema.safeParse(fullData);
      if (!validationResult.success) {
        const errors = validationResult.error.format();
        console.error("Unauthenticated validation errors:", errors);
        return NextResponse.json({
          success: false,
          message: 'Validation failed',
          errors
        }, { status: 400, headers: corsHeaders });
      }
      parsed = validationResult;

      // For unauthenticated users, handle user creation/lookup
      userInfo = (parsed.data as z.infer<typeof startProjectFormSchema>).userInfo;
      existingUser = await prisma.user.upsert({
        where: { email: userInfo.email.toLowerCase() },
        create: {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email.toLowerCase(),
          role: 'client',
          isActive: true,
          projectCount: 1,
        },
        update: {
          projectCount: { increment: 1 },
        },
      });
    }

    // Prepare project data with user information
    const projectDetails = isAuthenticated ? parsed.data.projectDetails : (parsed.data as any).projectDetails;
    const pricing = isAuthenticated ? parsed.data.pricing : (parsed.data as any).pricing;
    
    const projectToSave: any = {
      // Store key descriptive fields inside the JSON column `projectDetails`
      projectDetails: {
        title: projectDetails.title,
        description: projectDetails.description,
        category: projectDetails.category,
        requirements: projectDetails.requirements,
        priority: projectDetails.priority || 'low',
        timeline: projectDetails.timeline
      },
      clientId: existingUser.id,
      status: 'pending',
      priority: projectDetails.priority || 'low',
      budget: Number(pricing?.fixedBudget) || 0,
      timeline: projectDetails.timeline,
      techStack: projectDetails.techStack || [],
      requiredSkills: projectDetails.requiredSkills || [],
      experienceLevel: projectDetails.experienceLevel || 'Mid-level',
      maxTeamSize: projectDetails.maxTeamSize || 1,
      estimatedCompletionDate: projectDetails.estimatedCompletionDate ? new Date(projectDetails.estimatedCompletionDate) : null,
      milestones: pricing?.milestones || [],
      pricing: {
        ...pricing,
        fixedBudget: Number(pricing?.fixedBudget) || null,
        hourlyRate: Number(pricing?.hourlyRate) || null,
        estimatedHours: Number(pricing?.estimatedHours) || null,
      }
    };

    // Save the project
    const project = await prisma.project.create({ data: projectToSave });
    console.log('Project saved successfully:', project.id);

    // Return success immediately - don't block on chat creation
    const successResponse = {
      success: true,
      message: 'Project submitted successfully',
      projectId: project.id
    };

    // Try to create chat asynchronously (non-blocking)
    if (project.id) {
      // Use setImmediate to avoid blocking the response
      setImmediate(async () => {
        try {
          console.log('Attempting to create project chat...');
          
          // Check if Prisma is available
          await prisma.$connect();
          console.log('Prisma connected successfully');
          
          const admin = await prisma.user.findFirst({ where: { role: "admin" } });
          console.log('Admin user found:', admin ? 'Yes' : 'No');

          if (admin) {
            const projectChat = await prisma.projectChat.create({
              data: {
                projectId: project.id,
                lastActivity: new Date(),
              },
            });
            console.log('Project chat created:', projectChat.id);

            // Add client as participant
            await prisma.chatParticipant.create({
              data: {
                chatId: projectChat.id,
                userId: existingUser.id,
                name: `${existingUser.firstName} ${existingUser.lastName}`,
                role: 'client',
                isOnline: false,
              },
            });

            // Add admin as participant
            await prisma.chatParticipant.create({
              data: {
                chatId: projectChat.id,
                userId: admin.id,
                name: admin.firstName || 'Admin',
                role: 'admin',
                isOnline: false,
              },
            });
            console.log('Chat participants added successfully');
          } else {
            console.warn('No admin user found - chat creation skipped');
          }
        } catch (chatError) {
          console.error('Failed to create project chat (non-blocking):', chatError);
          // This is now non-blocking, so it won't affect the API response
        } finally {
          await prisma.$disconnect();
        }
      });
    }

    return NextResponse.json(successResponse, { headers: corsHeaders });

  } catch (error) {
    console.error('Error submitting project:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to submit project',
      error: error instanceof Error ? error.message : error
    }, { status: 500, headers: corsHeaders });
  }
}
