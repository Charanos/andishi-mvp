const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOrphanedAssignments() {
  console.log('Starting cleanup of orphaned project assignments...');

  try {
    // Get all project assignments
    const allAssignments = await prisma.projectAssignment.findMany({
      select: {
        id: true,
        developerId: true,
      },
    });

    if (allAssignments.length === 0) {
      console.log('No project assignments found to check.');
      return;
    }

    console.log(`Found ${allAssignments.length} project assignments to verify.`);

    // Get all existing developer IDs
    const allDeveloperProfiles = await prisma.developerProfile.findMany({
      select: {
        id: true,
      },
    });
    const existingDeveloperIds = new Set(allDeveloperProfiles.map(p => p.id));

    console.log(`Found ${existingDeveloperIds.size} existing developer profiles.`);

    // Find assignments where the developerId does not exist in the set of developer profile IDs
    const orphanedAssignments = allAssignments.filter(
      (assignment) => !existingDeveloperIds.has(assignment.developerId)
    );

    if (orphanedAssignments.length === 0) {
      console.log('No orphaned project assignments found. Data is consistent.');
      return;
    }

    console.log(`Found ${orphanedAssignments.length} orphaned assignments to delete.`);

    const orphanedAssignmentIds = orphanedAssignments.map(a => a.id);

    // Delete the orphaned assignments
    const deleteResult = await prisma.projectAssignment.deleteMany({
      where: {
        id: {
          in: orphanedAssignmentIds,
        },
      },
    });

    console.log(`Successfully deleted ${deleteResult.count} orphaned project assignments.`);

  } catch (error) {
    console.error('An error occurred during cleanup:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Cleanup script finished.');
  }
}

cleanupOrphanedAssignments();
