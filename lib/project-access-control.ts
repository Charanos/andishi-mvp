/**
 * Project Access Control Utilities
 * Handles role-based data filtering for projects with contract details
 */

export type UserRole = 'admin' | 'client' | 'developer';

export interface ProjectWithContract {
  id: string;
  pricing?: {
    type: string;
    currency: string;
    contractDetails?: {
      engagementType: string;
      duration: string;
      durationUnit: string;
      workingHoursPerWeek: string;
      monthlyRate: string;
      jobDescription: string;
      startDate?: string;
      endDate?: string;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Filters project data based on user role
 * - Admin: Full access to all data including contract value
 * - Client: Full access to all data including contract value
 * - Developer: Limited access - contract value (monthlyRate) is hidden
 */
export function filterProjectByRole(
  project: ProjectWithContract,
  userRole: UserRole
): ProjectWithContract {
  // Admin and Client get full access
  if (userRole === 'admin' || userRole === 'client') {
    return project;
  }

  // Developer: Hide sensitive contract information
  if (userRole === 'developer' && project.pricing?.contractDetails) {
    const filteredProject = { ...project };
    
    if (filteredProject.pricing && filteredProject.pricing.contractDetails) {
      const contractDetails = filteredProject.pricing.contractDetails;
      
      filteredProject.pricing = {
        ...filteredProject.pricing,
        contractDetails: {
          monthlyRate: '[HIDDEN]', // Hide the monthly rate from developers
          // Keep other contract details visible
          engagementType: contractDetails.engagementType,
          duration: contractDetails.duration,
          durationUnit: contractDetails.durationUnit,
          workingHoursPerWeek: contractDetails.workingHoursPerWeek,
          jobDescription: contractDetails.jobDescription,
          startDate: contractDetails.startDate,
          endDate: contractDetails.endDate,
        },
      };
    }

    return filteredProject;
  }

  return project;
}

/**
 * Filters an array of projects based on user role
 */
export function filterProjectsByRole(
  projects: ProjectWithContract[],
  userRole: UserRole
): ProjectWithContract[] {
  return projects.map((project) => filterProjectByRole(project, userRole));
}

/**
 * Checks if a user has access to view contract value
 */
export function canViewContractValue(userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'client';
}

/**
 * Gets display text for contract value based on role
 */
export function getContractValueDisplay(
  monthlyRate: string,
  currency: string,
  userRole: UserRole
): string {
  if (canViewContractValue(userRole)) {
    return `${currency} ${monthlyRate}/month`;
  }
  return 'Contact admin for rate details';
}
