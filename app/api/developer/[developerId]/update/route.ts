import { NextRequest, NextResponse } from "next/server";

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
      // Handle unassignment
      console.log(`Unassigning developer ${developerId} from project:`, body.projectId);
      
      // Update developer profile upon unassignment
      const profileUpdateSuccess = await updateDeveloperProfile(developerId, {
        removeProject: body.projectId,
        updateAvailability: 'available',
        updateActiveProjects: -1
      });
      
      if (!profileUpdateSuccess) {
        console.warn('Failed to update developer profile, but unassignment will continue');
      }
      
      return NextResponse.json({
        success: true,
        message: "Developer successfully unassigned from project",
        data: {
          developerId,
          unassignedProjectId: body.projectId,
          profileUpdated: profileUpdateSuccess,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (body.projectComplete) {
      // Handle project completion
      console.log(`Marking project ${body.projectId} as complete for developer ${developerId}`);
      
      // Update developer profile when project is completed
      const profileUpdateSuccess = await updateDeveloperProfile(developerId, {
        completeProject: body.projectId,
        updateAvailability: 'available',
        updateActiveProjects: -1,
        updateCompletedProjects: 1,
        updateStats: true
      });
      
      if (!profileUpdateSuccess) {
        console.warn('Failed to update developer profile, but project completion will continue');
      }
      
      return NextResponse.json({
        success: true,
        message: "Project marked as complete for developer",
        data: {
          developerId,
          completedProjectId: body.projectId,
          profileUpdated: profileUpdateSuccess,
          timestamp: new Date().toISOString(),
        },
      });
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
