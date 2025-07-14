import prisma from "@/lib/prisma";

export interface DeveloperAvailabilityStatus {
  isAvailable: boolean;
  busyUntilDate?: Date;
  status: 'available' | 'busy' | 'busy_until_date' | 'pending_approval';
  displayText: string;
}

/**
 * Check and update developer availability based on busyUntilDate
 * This function should be called periodically to clean up expired busyUntilDate entries
 */
export async function checkAndUpdateDeveloperAvailability(developerId: string): Promise<DeveloperAvailabilityStatus> {
  try {
    const developer = await prisma.developerProfile.findUnique({
      where: { id: developerId },
      select: {
        isAvailable: true,
        busyUntilDate: true,
        assignments: {
          where: {
            status: { notIn: ["completed", "cancelled"] }
          }
        }
      }
    });

    if (!developer) {
      throw new Error(`Developer with ID ${developerId} not found`);
    }

    const now = new Date();
    let shouldUpdate = false;
    let updateData: any = {};

    // Check if busyUntilDate has passed
    if (developer.busyUntilDate && developer.busyUntilDate <= now) {
      // busyUntilDate has passed, check if developer should be available
      if (developer.assignments.length === 0) {
        // No active assignments, make available
        updateData = {
          isAvailable: true,
          busyUntilDate: null,
        };
        shouldUpdate = true;
      } else {
        // Has active assignments, clear busyUntilDate but keep busy
        updateData = {
          isAvailable: false,
          busyUntilDate: null,
        };
        shouldUpdate = true;
      }
    }

    // Update developer profile if needed
    if (shouldUpdate) {
      await prisma.developerProfile.update({
        where: { id: developerId },
        data: updateData,
      });
      
      // Return updated status
      return {
        isAvailable: updateData.isAvailable,
        busyUntilDate: updateData.busyUntilDate,
        status: updateData.isAvailable ? 'available' : 'busy',
        displayText: updateData.isAvailable ? 'Available' : 'Busy'
      };
    }

    // Return current status
    const currentStatus = getCurrentAvailabilityStatus(developer.isAvailable, developer.busyUntilDate);
    return currentStatus;
  } catch (error) {
    console.error(`Error checking developer availability for ${developerId}:`, error);
    throw error;
  }
}

/**
 * Get current availability status without updating the database
 */
export function getCurrentAvailabilityStatus(isAvailable: boolean, busyUntilDate?: Date | null): DeveloperAvailabilityStatus {
  const now = new Date();
  
  if (isAvailable) {
    return {
      isAvailable: true,
      status: 'available',
      displayText: 'Available'
    };
  }
  
  if (busyUntilDate && busyUntilDate > now) {
    return {
      isAvailable: false,
      busyUntilDate,
      status: 'busy_until_date',
      displayText: `Busy until ${busyUntilDate.toLocaleDateString()}`
    };
  }
  
  return {
    isAvailable: false,
    status: 'busy',
    displayText: 'Busy'
  };
}

/**
 * Get comprehensive availability status including approval status
 */
export function getComprehensiveAvailabilityStatus(
  isAvailable: boolean, 
  busyUntilDate?: Date | null, 
  profileStatus?: 'pending' | 'approved' | 'rejected'
): DeveloperAvailabilityStatus {
  // If profile is not approved, show approval status instead of availability
  if (profileStatus !== 'approved') {
    return {
      isAvailable: false,
      status: 'pending_approval',
      displayText: profileStatus === 'pending' ? 'Pending Approval' : 
                   profileStatus === 'rejected' ? 'Rejected' : 'Unapproved'
    };
  }
  
  // For approved developers, show actual availability
  return getCurrentAvailabilityStatus(isAvailable, busyUntilDate);
}

/**
 * Batch update all developers whose busyUntilDate has passed
 * This should be called by a scheduled job or cron task
 */
export async function batchUpdateExpiredBusyUntilDates(): Promise<number> {
  try {
    const now = new Date();
    
    // Find all developers whose busyUntilDate has passed
    const expiredDevelopers = await prisma.developerProfile.findMany({
      where: {
        busyUntilDate: { lte: now }
      },
      select: {
        id: true,
        assignments: {
          where: {
            status: { notIn: ["completed", "cancelled"] }
          }
        }
      }
    });

    let updatedCount = 0;

    for (const developer of expiredDevelopers) {
      const hasActiveAssignments = developer.assignments.length > 0;
      
      await prisma.developerProfile.update({
        where: { id: developer.id },
        data: {
          isAvailable: !hasActiveAssignments,
          busyUntilDate: null,
        }
      });

      updatedCount++;
    }

    console.log(`Updated ${updatedCount} developers with expired busyUntilDate`);
    return updatedCount;
  } catch (error) {
    console.error('Error batch updating expired busyUntilDate:', error);
    throw error;
  }
}

/**
 * Get all developers with their current availability status
 */
export async function getAllDevelopersWithAvailability(): Promise<Array<{
  id: string;
  user: any;
  data: any;
  availability: DeveloperAvailabilityStatus;
}>> {
  try {
    const developers = await prisma.developerProfile.findMany({
      select: {
        id: true,
        data: true,
        isAvailable: true,
        busyUntilDate: true,
        user: true,
        assignments: {
          where: {
            status: { notIn: ["completed", "cancelled"] }
          }
        }
      }
    });

    return developers.map(dev => ({
      id: dev.id,
      user: dev.user,
      data: dev.data,
      availability: getCurrentAvailabilityStatus(dev.isAvailable, dev.busyUntilDate)
    }));
  } catch (error) {
    console.error('Error getting developers with availability:', error);
    throw error;
  }
}
