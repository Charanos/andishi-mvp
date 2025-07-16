import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to validate MongoDB ObjectId format
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

interface RequestBody {
  assignedProject?: {
    projectId: string;
    title: string;
    techStack?: string[];
    experienceLevel?: string;
    status?: string;
    startDate?: string;
    deadline?: string;
    budget?: number;
    description?: string;
  };
  unassign?: boolean;
  projectId?: string;
  projectComplete?: boolean;
}

// Utility function to update developer profile in the developer-profiles API
async function updateDeveloperProfile(developerId: string, updateData: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/developer-profiles`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: developerId, // Fixed: API expects 'id' not 'developerId'
        ...updateData
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update developer profile via API:', response.status, errorText);
      return false;
    }
    
    const result = await response.json();
    console.log('Developer profile updated successfully via API:', result);
    return true;
  } catch (error) {
    console.error('Error updating developer profile:', error);
    return false;
  }
}

// Direct MongoDB update function for availability
async function updateDeveloperAvailabilityDirectly(developerId: string, isAvailable: boolean, busyUntilDate: Date | null = null) {
  try {
    const clientPromise = require('@/lib/mongodb').default;
    const client = await clientPromise;
    const db = client.db();
    
    // First try to find the developer profile by _id
    let updateResult = await db.collection('developerProfiles').updateOne(
      { _id: new (require('mongodb').ObjectId)(developerId) },
      { 
        $set: { 
          isAvailable: isAvailable,
          busyUntilDate: busyUntilDate,
          updatedAt: new Date()
        }
      }
    );
    
    // If not found by _id, try to find by userId
    if (updateResult.matchedCount === 0) {
      console.log(`Developer profile not found by _id ${developerId}, trying userId...`);
      updateResult = await db.collection('developerProfiles').updateOne(
        { userId: new (require('mongodb').ObjectId)(developerId) },
        { 
          $set: { 
            isAvailable: isAvailable,
            busyUntilDate: busyUntilDate,
            updatedAt: new Date()
          }
        }
      );
    }
    
    if (updateResult.matchedCount === 0) {
      console.error(`Developer profile ${developerId} not found in MongoDB by _id or userId`);
      return false;
    }
    
    console.log(`Successfully updated developer ${developerId} availability to ${isAvailable ? 'available' : 'busy'} via MongoDB`);
    return true;
  } catch (error) {
    console.error('Error updating developer availability directly:', error);
    return false;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ developerId: string }> }
): Promise<NextResponse> {
  try {
    const { developerId } = await params;
    const body: RequestBody = await request.json();

    console.log(`Processing assignment update for developer ${developerId}:`, body);
    
    // Validate developerId format (should be a valid MongoDB ObjectId)
    if (!developerId || !isValidObjectId(developerId)) {
      console.error(`Invalid developer ID format: ${developerId}`);
      return NextResponse.json({
        success: false,
        message: "Invalid developer ID format",
        error: "Developer ID must be a valid MongoDB ObjectId (24 hex characters)",
      }, { status: 400 });
    }

    if (body.assignedProject) {
      // Handle assignment
      console.log(`Assigning developer ${developerId} to project:`, body.assignedProject);
      
      const newProject = {
        id: body.assignedProject.projectId,
        title: body.assignedProject.title,
        description: body.assignedProject.description || 'Project assigned from admin dashboard',
        status: 'in-progress' as const,
        startDate: body.assignedProject.startDate || new Date().toISOString().split('T')[0],
        deadline: body.assignedProject.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        budget: body.assignedProject.budget || 0,
        progress: 0,
        priority: 'medium' as const,
        client: 'Admin Assigned',
        team: [developerId],
        technologies: body.assignedProject.techStack || [],
        riskLevel: 'low' as const,
        satisfaction: 3 as const
      };
      
      // Update developer profile availability directly using Prisma
      try {
        // First, verify the developer profile exists
        const existingProfile = await prisma.developerProfile.findUnique({
          where: { id: developerId },
          select: { id: true, userId: true }
        });
        
        if (!existingProfile) {
          console.error(`Developer profile with ID ${developerId} not found in Prisma`);
          // Don't return error here, continue with MongoDB update
        } else {
          // Update the developer profile via Prisma
          await prisma.developerProfile.update({
            where: { id: developerId },
            data: {
              isAvailable: false,
              busyUntilDate: null
            }
          });
          
          // Also update user status to reflect busy state
          if (existingProfile.userId) {
            await prisma.user.update({
              where: { id: existingProfile.userId },
              data: { status: "busy" }
            });
          }
          
          console.log(`Successfully updated developer profile ${developerId} to busy status via Prisma`);
        }
      } catch (error) {
        console.error('Error updating developer profile availability via Prisma:', error);
        // Don't return error here, continue with MongoDB update
      }
      
      // Update developer profile with new project via API
      const profileUpdateSuccess = await updateDeveloperProfile(developerId, {
        addProject: newProject,
        updateAvailability: 'busy',
        updateActiveProjects: 1
      });
      
      // Ensure availability is updated - use direct MongoDB update as fallback
      const availabilityUpdateSuccess = await updateDeveloperAvailabilityDirectly(developerId, false, null);
      
      if (!profileUpdateSuccess) {
        console.warn('Failed to update developer profile via API, but assignment will continue');
      }
      
      if (!availabilityUpdateSuccess) {
        console.warn('Failed to update developer availability directly');
      }
      
      return NextResponse.json({
        success: true,
        message: "Developer successfully assigned to project",
        data: {
          developerId,
          assignedProject: body.assignedProject,
          profileUpdated: profileUpdateSuccess,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (body.unassign) {
      // Handle unassignment with busyUntilDate logic
      console.log(`Unassigning developer ${developerId} from project:`, body.projectId);
      
      try {
        // Check if developer has other active assignments
        const otherActiveAssignments = await prisma.projectAssignment.count({
          where: {
            developerId,
            projectId: { not: body.projectId },
            status: { notIn: ["completed", "cancelled"] },
          },
        });

        let developerUpdateData: any = {};
        
        if (otherActiveAssignments === 0) {
          // No other active assignments, check if we need to set busyUntilDate
          const currentProject = await prisma.project.findUnique({
            where: { id: body.projectId },
            select: { estimatedCompletionDate: true }
          });

          const now = new Date();
          if (currentProject?.estimatedCompletionDate && 
              currentProject.estimatedCompletionDate > now) {
            // Project unassigned before estimated completion date
            developerUpdateData = {
              isAvailable: false,
              busyUntilDate: currentProject.estimatedCompletionDate,
            };
          } else {
            // Project unassigned on or after estimated completion date
            developerUpdateData = {
              isAvailable: true,
              busyUntilDate: null,
            };
          }
        } else {
          // Developer has other active assignments, keep them busy
          developerUpdateData = {
            isAvailable: false,
            busyUntilDate: null,
          };
        }

        // First, verify the developer profile exists
        const existingProfile = await prisma.developerProfile.findUnique({
          where: { id: developerId },
          select: { id: true, userId: true }
        });
        
        if (!existingProfile) {
          console.error(`Developer profile with ID ${developerId} not found`);
          return NextResponse.json({
            success: false,
            message: "Developer profile not found",
            error: "The specified developer profile does not exist in the database",
          }, { status: 404 });
        }
        
        // Update the developer profile directly
        await prisma.developerProfile.update({
          where: { id: developerId },
          data: developerUpdateData,
        });
        
        // Update user status to reflect availability
        if (existingProfile.userId) {
          await prisma.user.update({
            where: { id: existingProfile.userId },
            data: { status: developerUpdateData.isAvailable ? "active" : "busy" }
          });
        }

        // Also update through the legacy API for backwards compatibility
        const profileUpdateSuccess = await updateDeveloperProfile(developerId, {
          removeProject: body.projectId,
          updateAvailability: developerUpdateData.isAvailable ? 'available' : 'busy',
          updateActiveProjects: -1
        });
        
        if (!profileUpdateSuccess) {
          console.warn('Failed to update developer profile via legacy API, but unassignment will continue');
        }
        
        return NextResponse.json({
          success: true,
          message: "Developer successfully unassigned from project",
          data: {
            developerId,
            unassignedProjectId: body.projectId,
            profileUpdated: true,
            availabilityStatus: developerUpdateData,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error during unassignment:', error);
        return NextResponse.json({
          success: false,
          message: "Failed to unassign developer",
          error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
      }
    }

    if (body.projectComplete) {
      // Handle project completion with busyUntilDate logic
      console.log(`Marking project ${body.projectId} as complete for developer ${developerId}`);
      
      try {
        // Check if developer has other active assignments
        const otherActiveAssignments = await prisma.projectAssignment.count({
          where: {
            developerId,
            projectId: { not: body.projectId },
            status: { notIn: ["completed", "cancelled"] },
          },
        });

        let developerUpdateData: any = {};
        
        if (otherActiveAssignments === 0) {
          // No other active assignments, check if we need to set busyUntilDate
          const completedProject = await prisma.project.findUnique({
            where: { id: body.projectId },
            select: { estimatedCompletionDate: true }
          });

          const now = new Date();
          if (completedProject?.estimatedCompletionDate && 
              completedProject.estimatedCompletionDate > now) {
            // Project completed before estimated completion date
            developerUpdateData = {
              isAvailable: false,
              busyUntilDate: completedProject.estimatedCompletionDate,
            };
          } else {
            // Project completed on or after estimated completion date
            developerUpdateData = {
              isAvailable: true,
              busyUntilDate: null,
            };
          }
        } else {
          // Developer has other active assignments, keep them busy
          developerUpdateData = {
            isAvailable: false,
            busyUntilDate: null,
          };
        }

        // First, verify the developer profile exists
        const existingProfile = await prisma.developerProfile.findUnique({
          where: { id: developerId },
          select: { id: true, userId: true }
        });
        
        if (!existingProfile) {
          console.error(`Developer profile with ID ${developerId} not found`);
          return NextResponse.json({
            success: false,
            message: "Developer profile not found",
            error: "The specified developer profile does not exist in the database",
          }, { status: 404 });
        }
        
        // Update the developer profile directly
        await prisma.developerProfile.update({
          where: { id: developerId },
          data: developerUpdateData,
        });
        
        // Update user status to reflect availability
        if (existingProfile.userId) {
          await prisma.user.update({
            where: { id: existingProfile.userId },
            data: { status: developerUpdateData.isAvailable ? "active" : "busy" }
          });
        }

        // Mark the assignment as completed
        await prisma.projectAssignment.updateMany({
          where: {
            developerId,
            projectId: body.projectId,
          },
          data: {
            status: "completed",
          },
        });

        // Also update through the legacy API for backwards compatibility
        const profileUpdateSuccess = await updateDeveloperProfile(developerId, {
          completeProject: body.projectId,
          updateAvailability: developerUpdateData.isAvailable ? 'available' : 'busy',
          updateActiveProjects: -1,
          updateCompletedProjects: 1,
          updateStats: true
        });
        
        if (!profileUpdateSuccess) {
          console.warn('Failed to update developer profile via legacy API, but project completion will continue');
        }
        
        return NextResponse.json({
          success: true,
          message: "Project marked as complete for developer",
          data: {
            developerId,
            completedProjectId: body.projectId,
            profileUpdated: true,
            availabilityStatus: developerUpdateData,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Error during project completion:', error);
        return NextResponse.json({
          success: false,
          message: "Failed to mark project as complete",
          error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      message: "No valid action specified",
    }, { status: 400 });

  } catch (error) {
    console.error("Error updating developer profile:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update developer profile",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
