import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        developerId,
        ...updateData
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to update developer profile via API');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating developer profile:', error);
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
      
      // Update developer profile availability directly
      try {
        await prisma.developerProfile.update({
          where: { id: developerId },
          data: {
            isAvailable: false,
            busyUntilDate: null
          }
        });
        
        // Also update user status to reflect busy state
        // Find the user associated with this developer profile
        const developerProfile = await prisma.developerProfile.findUnique({
          where: { id: developerId },
          select: { userId: true }
        });
        
        if (developerProfile?.userId) {
          await prisma.user.update({
            where: { id: developerProfile.userId },
            data: { status: "busy" }
          });
        }
      } catch (error) {
        console.error('Error updating developer profile availability:', error);
      }
      
      // Update developer profile with new project
      const profileUpdateSuccess = await updateDeveloperProfile(developerId, {
        addProject: newProject,
        updateAvailability: 'busy',
        updateActiveProjects: 1
      });
      
      if (!profileUpdateSuccess) {
        console.warn('Failed to update developer profile, but assignment will continue');
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

        // Update the developer profile directly
        await prisma.developerProfile.update({
          where: { id: developerId },
          data: developerUpdateData,
        });
        
        // Update user status to reflect availability
        // Find the user associated with this developer profile
        const developerProfile = await prisma.developerProfile.findUnique({
          where: { id: developerId },
          select: { userId: true }
        });
        
        if (developerProfile?.userId) {
          await prisma.user.update({
            where: { id: developerProfile.userId },
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

        // Update the developer profile directly
        await prisma.developerProfile.update({
          where: { id: developerId },
          data: developerUpdateData,
        });
        
        // Update user status to reflect availability
        // Find the user associated with this developer profile
        const developerProfile = await prisma.developerProfile.findUnique({
          where: { id: developerId },
          select: { userId: true }
        });
        
        if (developerProfile?.userId) {
          await prisma.user.update({
            where: { id: developerProfile.userId },
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
