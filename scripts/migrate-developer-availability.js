const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateDeveloperAvailability() {
  try {
    console.log('Starting migration: Adding busyUntilDate field to DeveloperProfile...');
    
    // First, let's check the current database schema
    const existingProfiles = await prisma.developerProfile.findMany({
      select: {
        id: true,
        isAvailable: true,
        assignments: {
          where: {
            status: { notIn: ["completed", "cancelled"] }
          },
          select: {
            id: true,
            status: true,
            project: {
              select: {
                id: true,
                title: true,
                estimatedCompletionDate: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${existingProfiles.length} developer profiles to check...`);

    let updatedCount = 0;
    
    for (const profile of existingProfiles) {
      try {
        // Check if this developer should have their availability updated
        const hasActiveAssignments = profile.assignments.length > 0;
        
        if (!hasActiveAssignments && !profile.isAvailable) {
          // Developer has no active assignments but is marked as unavailable
          // This might be a case where they should be available now
          await prisma.developerProfile.update({
            where: { id: profile.id },
            data: {
              isAvailable: true,
              busyUntilDate: null,
            }
          });
          console.log(`Updated profile ${profile.id}: Set to available (no active assignments)`);
          updatedCount++;
        } else if (hasActiveAssignments && profile.isAvailable) {
          // Developer has active assignments but is marked as available
          // This might be incorrect, let's make them busy
          await prisma.developerProfile.update({
            where: { id: profile.id },
            data: {
              isAvailable: false,
              busyUntilDate: null,
            }
          });
          console.log(`Updated profile ${profile.id}: Set to busy (has active assignments)`);
          updatedCount++;
        }
        
        // For now, we'll set busyUntilDate to null for all profiles
        // This field will be populated as projects are completed/deleted going forward
        
      } catch (error) {
        console.error(`Error updating profile ${profile.id}:`, error);
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} profiles.`);
    
    // Verify the migration by checking a few profiles
    const sampleProfiles = await prisma.developerProfile.findMany({
      take: 5,
      select: {
        id: true,
        isAvailable: true,
        busyUntilDate: true,
        assignments: {
          where: {
            status: { notIn: ["completed", "cancelled"] }
          },
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    console.log('\nSample profiles after migration:');
    sampleProfiles.forEach(profile => {
      console.log(`Profile ${profile.id}: Available=${profile.isAvailable}, BusyUntil=${profile.busyUntilDate}, ActiveAssignments=${profile.assignments.length}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateDeveloperAvailability()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
