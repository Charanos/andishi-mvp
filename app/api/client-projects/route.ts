import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';


const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const getCorsHeaders = (request: NextRequest) => {
  const origin = request.headers.get('origin');
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { headers: getCorsHeaders(request) });
}

// Add type definitions
interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  budget: number;
  timeline: string;
  status: string;
  dueDate?: Date | null;
  completedAt?: Date | null;
  order: number;
  deliverables?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  type: string;
  author?: string | null;
  createdAt: Date;
}

interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  fileType?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
}

interface ProjectPayment {
  id: string;
  amount: number;
  date: Date;
  method: string;
  status: string;
  submittedBy: string;
  notes?: string | null;
  description?: string | null;
  currency?: string | null;
  invoiceUrl?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Helper to extract auth info if middleware headers are missing
const authenticateRequest = async (req: NextRequest) => {
  const headerEmail = req.headers.get('user-email');
  const headerRole = req.headers.get('user-role');
  if (headerEmail && headerRole) {
    return { userEmail: headerEmail, userRole: headerRole };
  }

  // Fallback to cookie verification (for routes that bypass middleware)
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return { userEmail: null, userRole: null };

  try {
    const secretValue = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
    if (!secretValue) throw new Error('JWT secret missing');
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);
    return { userEmail: payload.email as string, userRole: payload.role as string };
  } catch {
    return { userEmail: null, userRole: null };
  }
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return new Date().getTime().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to find item in array by id
const findItemById = (array: any[], id: string) => {
  return array.find(item => item.id === id);
};

// Helper function to update item in array by id
const updateItemInArray = (array: any[], id: string, updates: any) => {
  return array.map(item =>
    item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
  );
};

// Helper function to remove item from array by id
const removeItemFromArray = (array: any[], id: string) => {
  return array.filter(item => item.id !== id);
};

// GET handler to fetch projects for the logged-in client
export async function GET(req: NextRequest) {
  try {
    const { userEmail, userRole } = await authenticateRequest(req);

    if (!userEmail || !userRole) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: getCorsHeaders(req) }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id');
    let projects: any[] = [];

    // Collect client user info separately to avoid relying on Prisma relations
    // (Project model currently lacks explicit client relation)


    // Fetch a single project by ID
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project || (userRole !== 'admin' && project.clientId !== userEmail)) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Project not found' }),
          { status: 404, headers: getCorsHeaders(req) }
        );
      }
      projects = [project];
    } else if (userRole === 'admin') {
      // Admins have access to all projects
      projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Fetch projects for a client
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });

      if (!user) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'User not found or not authorized' }),
          { status: 404, headers: getCorsHeaders(req) }
        );
      }

      projects = await prisma.project.findMany({
        where: { clientId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Deduplicate in case of accidental duplicates (e.g., repeated seeding)
    const uniqueProjectsMap = new Map<string, typeof projects[0]>();
    for (const proj of projects) {
      if (!uniqueProjectsMap.has(proj.id)) uniqueProjectsMap.set(proj.id, proj);
    }

    // Transform projects to ensure consistent structure and keep nested details
    // Fetch user info for all unique clientIds
    const clientIds = Array.from(uniqueProjectsMap.values()).map(p => p.clientId).filter(Boolean);
    const clientUsers = clientIds.length ? await prisma.user.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, firstName: true, lastName: true, email: true, company: true }
    }) : [];
    const clientMap: Record<string, any> = {};
    clientUsers.forEach((u: any) => { clientMap[u.id] = u; });

    const transformedProjects = Array.from(uniqueProjectsMap.values()).map((project: any) => {
      const details = project.projectDetails || {};
      const derivedTitle = project.title || details.title || '';
      const derivedDescription = project.description || details.description || '';
      const clientInfo = clientMap[project.clientId] ? {
        id: clientMap[project.clientId].id,
        firstName: clientMap[project.clientId].firstName,
        lastName: clientMap[project.clientId].lastName,
        email: clientMap[project.clientId].email,
        company: clientMap[project.clientId].company,
      } : {};
      // Merge existing embedded userInfo (if any) to keep phone, company, etc.
      const userInfo = { ...project.userInfo, ...clientInfo };

      return {
        _id: project.id, // Keep Mongo-style _id for front-end compatibility
        id: project.id,
        title: derivedTitle,
        description: derivedDescription,
        projectDetails: details,
        userInfo: userInfo,
        status: project.status || 'pending',
        priority: project.priority || 'low',
        progress: project.progress || 0,
        techStack: project.techStack || details.techStack || [],
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        milestones: project.milestones || [],
        updates: project.updates || [],
        files: project.files || [],
        payments: project.payments || [],
        pricing: project.pricing
      };
    });

    if (projectId) {
      return new NextResponse(JSON.stringify({
        success: true,
        data: transformedProjects[0] || null
      }), { status: 200, headers: getCorsHeaders(req) });
    } else {
      return new NextResponse(JSON.stringify({
        success: true,
        data: transformedProjects
      }), { status: 200, headers: getCorsHeaders(req) });
    }

  } catch (error) {
    console.error('Error fetching client projects:', error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to fetch projects', error: error instanceof Error ? error.message : error }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

// POST handler to create a new project
export async function POST(req: NextRequest) {
  try {
    // Check content length to prevent oversized payloads
    const contentLength = req.headers.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (contentLength && parseInt(contentLength) > maxSize) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Request payload too large. Please reduce content size.'
        }),
        { status: 413, headers: getCorsHeaders(req) }
      );
    }

    const userEmail = req.headers.get('user-email');

    if (!userEmail) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: getCorsHeaders(req) }
      );
    }

    // Verify user is a client
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized access' }),
        { status: 403, headers: getCorsHeaders(req) }
      );
    }

    const projectData = await req.json();

    // Enhanced validation for content lengths
    if (projectData.title && projectData.title.length > 200) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Project title is too long. Maximum 200 characters allowed.'
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    if (projectData.description && projectData.description.length > 10000) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Project description is too long. Maximum 10,000 characters allowed.'
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    if (projectData.techStack && projectData.techStack.length > 20) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Too many technologies selected. Maximum 20 allowed.'
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    if (projectData.pricing?.milestones && projectData.pricing.milestones.length > 10) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Too many milestones. Maximum 10 allowed.'
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Check for duplicate submission
    if (projectData.clientSubmissionId) {
      const existingProjects = await prisma.project.findMany({
        where: { clientId: user.id },
        select: { projectDetails: true, id: true }
      });

      const existingProject = existingProjects.find((p: any) =>
        (p.projectDetails as any)?.title === projectData.projectDetails.title
      );

      if (existingProject) {
        return new NextResponse(JSON.stringify({
          success: false,
          message: 'Duplicate submission detected. Project already exists.',
          existingProjectId: existingProject.id
        }), { status: 409, headers: getCorsHeaders(req) });
      }
    }

    // Create milestones data for embedded field
    const milestones = projectData.pricing?.type === 'milestone' && projectData.pricing?.milestones
      ? projectData.pricing.milestones.map((m: any, index: number) => ({
        id: generateId(),
        title: m.title,
        description: m.description || '',
        budget: parseFloat(m.budget) || 0,
        timeline: m.timeline || '',
        status: m.status || 'pending',
        dueDate: m.dueDate ? new Date(m.dueDate) : null,
        order: m.order || index,
        deliverables: m.deliverables || [],
        completedAt: null
      }))
      : [];

    const createdProject = await prisma.project.create({
      data: {
        projectDetails: {
          title: projectData.projectDetails.title,
          description: projectData.projectDetails.description || '',
          category: projectData.projectDetails.category || '',
        },
        status: 'pending',
        priority: projectData.priority || 'medium',
        budget: projectData.budget || 0,
        timeline: projectData.timeline || '',
        techStack: projectData.techStack || [],
        requiredSkills: projectData.requiredSkills || [],
        experienceLevel: projectData.experienceLevel || 'Mid-level',
        maxTeamSize: projectData.maxTeamSize || 1,
        clientId: user.id,
        pricing: projectData.pricing ? {
          type: projectData.pricing.type,
          currency: projectData.pricing.currency || 'USD',
          fixedBudget: projectData.pricing.fixedBudget || null,
          hourlyRate: projectData.pricing.hourlyRate || null,
          estimatedHours: projectData.pricing.estimatedHours || null
        } : null,
        milestones: milestones,
        updates: [],
        files: [],
        payments: []
      }
    });

    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Project created successfully',
      project: createdProject
    }), { status: 200, headers: getCorsHeaders(req) });

  } catch (error) {
    console.error('Error creating project:', error);
    
    // Handle specific error types
    let errorMessage = 'Failed to create project';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Payload too large')) {
        errorMessage = 'Request payload too large. Please reduce content size.';
        statusCode = 413;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again with smaller content.';
        statusCode = 408;
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'A project with this title already exists. Please use a different title.';
        statusCode = 409;
      } else if (error.message.includes('validation')) {
        errorMessage = 'Validation failed. Please check your input and try again.';
        statusCode = 400;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : error
      }),
      { status: statusCode, headers: getCorsHeaders(req) }
    );
  }
}

// PATCH handler to update a project
export async function PATCH(req: NextRequest) {
  try {
    const { userEmail, userRole } = await authenticateRequest(req);

    if (!userEmail || !userRole) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: getCorsHeaders(req) }
      );
    }

    // For client role ensure user exists and active, for admin skip
    let clientUser: any = null;
    if (userRole === 'client') {
      clientUser = await prisma.user.findUnique({
        where: {
          email: userEmail,
          role: 'client',
          isActive: true
        }
      });
      if (!clientUser) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Unauthorized access' }),
          { status: 403, headers: getCorsHeaders(req) }
        );
      }
    }

    const body = await req.json();
    const { projectId, ...updates } = body;

    if (!projectId || Object.keys(updates).length === 0) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Project ID and at least one update field are required',
        }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Verify the project belongs to the client or allow admin
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || (userRole !== 'admin' && project?.clientId !== userEmail)) {
      return new NextResponse(JSON.stringify({ success: false, message: 'Project not found' }),
        { status: 404, headers: getCorsHeaders(req) });
    }

    // Handle different CRUD operations based on request type
    if (updates.operation) {
      const { operation, data, itemId } = updates;

      try {
        switch (operation) {
          case 'milestone_create':
            const newMilestone = {
              id: generateId(),
              title: data.title,
              description: data.description || '',
              budget: parseFloat(data.budget) || 0,
              timeline: data.timeline || '',
              status: data.status || 'pending',
              dueDate: data.dueDate ? new Date(data.dueDate) : null,
              order: data.order || 0,
              deliverables: data.deliverables || [],
              completedAt: null
            };

            const updatedMilestones = [...(project.milestones || []), newMilestone];

            await prisma.project.update({
              where: { id: projectId },
              data: { milestones: updatedMilestones }
            });

            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Milestone created successfully',
              data: newMilestone
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'milestone_update':
            const currentMilestones = project.milestones || [];
            const updatedMilestoneArray = currentMilestones.map((m: any) => {
              if (m.id === itemId) {
                return {
                  ...m,
                  ...data,
                  id: m.id, // Ensure id is preserved
                  dueDate: data.dueDate ? new Date(data.dueDate) : m.dueDate,
                  completedAt: data.completedAt ? new Date(data.completedAt) : m.completedAt,
                  budget: data.budget ? parseFloat(data.budget) : m.budget
                };
              }
              return m;
            });

            await prisma.project.update({
              where: { id: projectId },
              data: { milestones: updatedMilestoneArray }
            });

            const updatedMilestone = findItemById(updatedMilestoneArray, itemId);
            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Milestone updated successfully',
              data: updatedMilestone
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'milestone_delete':
            const milestonesAfterDelete = removeItemFromArray(project.milestones || [], itemId);

            await prisma.project.update({
              where: { id: projectId },
              data: { milestones: milestonesAfterDelete }
            });

            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Milestone deleted successfully'
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'file_create':
            const newFile = {
              id: generateId(),
              fileName: data.fileName,
              fileUrl: data.fileUrl,
              fileSize: data.fileSize || null,
              fileType: data.fileType || null,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const updatedFiles = [...(project.files || []), newFile];

            await prisma.project.update({
              where: { id: projectId },
              data: { files: updatedFiles }
            });

            return new NextResponse(JSON.stringify({
              success: true,
              message: 'File created successfully',
              data: newFile
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'file_update':
            const currentFiles = project.files || [];
            const updatedFileArray = currentFiles.map((f: any) => {
              if (f.id === itemId) {
                return {
                  ...f,
                  ...data,
                  id: f.id, // Ensure id is preserved
                  updatedAt: new Date()
                };
              }
              return f;
            });

            await prisma.project.update({
              where: { id: projectId },
              data: { files: updatedFileArray }
            });

            const updatedFile = findItemById(updatedFileArray, itemId);
            return new NextResponse(JSON.stringify({
              success: true,
              message: 'File updated successfully',
              data: updatedFile
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'file_delete':
            const filesAfterDelete = removeItemFromArray(project.files || [], itemId);

            await prisma.project.update({
              where: { id: projectId },
              data: { files: filesAfterDelete }
            });

            return new NextResponse(JSON.stringify({
              success: true,
              message: 'File deleted successfully'
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'payment_create':
            const newPayment = {
              id: generateId(),
              amount: parseFloat(data.amount) || 0,
              date: data.date ? new Date(data.date) : new Date(),
              method: data.method || 'bank_transfer',
              status: data.status || 'pending',
              submittedBy: data.submittedBy || 'client',
              notes: data.description || data.notes || null,
              description: data.description || data.notes || null,
              currency: data.currency || null,
              invoiceUrl: data.invoiceUrl || null,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            const updatedPayments = [...(project.payments || []), newPayment];

            await prisma.project.update({
              where: { id: projectId },
              data: { payments: updatedPayments }
            });

            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Payment created successfully',
              data: newPayment
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'payment_update':
            const currentPayments = project.payments || [];
            const updatedPaymentArray = currentPayments.map((p: any) => {
              if (p.id === itemId) {
                return {
                  ...p,
                  ...data,
                  id: p.id, // Ensure id is preserved
                  amount: data.amount ? parseFloat(data.amount) : p.amount,
                  date: data.date ? new Date(data.date) : p.date,
                  updatedAt: new Date()
                };
              }
              return p;
            });

            await prisma.project.update({
              where: { id: projectId },
              data: { payments: updatedPaymentArray }
            });

            const updatedPayment = findItemById(updatedPaymentArray, itemId);
            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Payment updated successfully',
              data: updatedPayment
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'payment_delete':
            const paymentsAfterDelete = removeItemFromArray(project.payments || [], itemId);

            await prisma.project.update({
              where: { id: projectId },
              data: { payments: paymentsAfterDelete }
            });

            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Payment deleted successfully'
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'update_create':
            const newUpdate = {
              id: generateId(),
              title: data.title,
              description: data.description,
              type: data.type || 'general',
              author: data.author || null,
              createdAt: new Date()
            };

            const updatedUpdates = [...(project.updates || []), newUpdate];

            await prisma.project.update({
              where: { id: projectId },
              data: { updates: updatedUpdates }
            });

            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Update created successfully',
              data: newUpdate
            }), { status: 200, headers: getCorsHeaders(req) });

          case 'update_delete':
            const updatesAfterDelete = removeItemFromArray(project.updates || [], itemId);

            await prisma.project.update({
              where: { id: projectId },
              data: { updates: updatesAfterDelete }
            });

            return new NextResponse(JSON.stringify({
              success: true,
              message: 'Update deleted successfully'
            }), { status: 200, headers: getCorsHeaders(req) });

          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

      } catch (operationError) {
        console.error(`Error in ${operation}:`, operationError);
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: `Failed to ${operation}`,
            error: operationError instanceof Error ? operationError.message : operationError
          }),
          { status: 500, headers: getCorsHeaders(req) }
        );
      }
    }

    // Handle bulk updates and basic project field updates
    const updateData: any = { updatedAt: new Date() };

    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.progress !== undefined) {
      updateData.progress = updates.progress;
      // If progress reaches 100, mark the project as completed
      if (updates.progress === 100) {
        updateData.status = 'completed';
        updateData.actualCompletionDate = new Date();
      }
    }

    // Handle array updates for bulk operations
    if (Array.isArray(updates.updates) && updates.updates.length) {
      const newUpdates = updates.updates.map((update: any) => ({
        id: generateId(),
        title: update.title,
        description: update.description,
        type: update.type || 'general',
        author: update.author || 'Client',
        createdAt: new Date()
      }));
      updateData.updates = [...(project.updates || []), ...newUpdates];
    }

    if (Array.isArray(updates.files) && updates.files.length) {
      const newFiles = updates.files.map((file: any) => ({
        id: generateId(),
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize || 0,
        fileType: file.fileType || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      updateData.files = [...(project.files || []), ...newFiles];
    }

    if (Array.isArray(updates.payments) && updates.payments.length) {
      const newPayments = updates.payments.map((payment: any) => ({
        id: generateId(),
        amount: parseFloat(payment.amount) || 0,
        date: payment.date ? new Date(payment.date) : new Date(),
        method: payment.method || 'bank_transfer',
        status: payment.status || 'pending',
        submittedBy: payment.submittedBy || 'client',
        notes: payment.description || payment.notes || '',
        description: payment.description || payment.notes || '',
        currency: payment.currency || 'USD',
        invoiceUrl: payment.invoiceUrl || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      updateData.payments = [...(project.payments || []), ...newPayments];
    }

    // Legacy milestone handling for backwards compatibility
    if (updates.milestones && !updates.operation) {
      const ms = updates.milestones as any;
      const currentMilestones = project.milestones || [];

      if (ms.id) {
        // Update existing milestone
        const updatedMilestoneArray = updateItemInArray(currentMilestones, ms.id, {
          title: ms.title,
          description: ms.description,
          budget: ms.budget ? parseFloat(ms.budget) : ms.budget,
          timeline: ms.timeline,
          status: ms.status,
          dueDate: ms.dueDate ? new Date(ms.dueDate) : undefined,
          completedAt: ms.completedAt ? new Date(ms.completedAt) : undefined
        });
        updateData.milestones = updatedMilestoneArray;
      } else {
        // Create new milestone
        const newMilestone: ProjectMilestone = {
          id: generateId(),
          title: ms.title,
          description: ms.description || '',
          budget: ms.budget ? parseFloat(ms.budget) : 0,
          timeline: ms.timeline || '',
          status: ms.status || 'pending',
          dueDate: ms.dueDate ? new Date(ms.dueDate) : undefined,
          order: ms.order || currentMilestones.length,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        updateData.milestones = [...currentMilestones, newMilestone];
      }
    }

    // Update the main project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData
    });

    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    }), { status: 200, headers: getCorsHeaders(req) });

  } catch (error) {
    console.error('Error updating project:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to update project',
        error: error instanceof Error ? error.message : error
      }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

// DELETE handler to delete a project
export async function DELETE(req: NextRequest) {
  try {
    const { userEmail, userRole } = await authenticateRequest(req);

    if (!userEmail || !userRole) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: getCorsHeaders(req) }
      );
    }

    let clientUser: any = null;
    if (userRole === 'client') {
      clientUser = await prisma.user.findUnique({
        where: {
          email: userEmail,
          role: 'client',
          isActive: true
        }
      });
      if (!clientUser) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Unauthorized access' }),
          { status: 403, headers: getCorsHeaders(req) }
        );
      }
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Project ID is required' }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Find the project with authorization check
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Project not found' }),
        { status: 404, headers: getCorsHeaders(req) }
      );
    }

    // Check authorization
    if (userRole !== 'admin' && project.clientId !== (clientUser?.id || userEmail)) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Unauthorized to delete this project' }),
        { status: 403, headers: getCorsHeaders(req) }
      );
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: projectId }
    });

    // Decrement project count for client user if needed
    if (userRole === 'client' && clientUser) {
      await prisma.user.update({
        where: { id: clientUser.id },
        data: { projectCount: { decrement: 1 } }
      });
    }

    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Project deleted successfully'
    }), { status: 200, headers: getCorsHeaders(req) });

  } catch (error) {
    console.error('Error deleting project:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'Failed to delete project',
        error: error instanceof Error ? error.message : error
      }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}