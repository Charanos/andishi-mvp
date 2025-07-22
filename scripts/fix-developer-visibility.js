/**
 * Fix Script: Developer Visibility in Admin Dashboard
 * 
 * This script fixes the issue where available developers don't show up
 * in the assignments tab by:
 * 1. Syncing developer profiles
 * 2. Approving pending developer profiles
 * 3. Updating user statuses
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDeveloperVisibility() {
  console.log('🔧 Fixing Developer Visibility Issues...\n');

  try {
    // Step 1: Sync developer profiles (create missing profiles)
    console.log('1️⃣ Syncing developer profiles...');
    
    const developersWithoutProfiles = await prisma.user.findMany({
      where: {
        role: 'developer',
        developerProfileStatus: { not: 'rejected' }
      }
    });

    let profilesCreated = 0;
    const defaultProfileData = {
      status: 'approved', // Auto-approve for existing developers
      isAvailable: true,
      createdAt: new Date(),
      data: {
        personalInfo: {
          firstName: 'Unknown',
          lastName: 'Developer',
          email: '',
          location: 'Unknown',
          tagline: 'Full Stack Developer'
        },
        professionalInfo: {
          title: 'Developer',
          experienceLevel: 'Mid-level',
          availability: 'Full-time',
          hourlyRate: 50,
          languages: [],
          certifications: [],
          preferredWorkType: []
        },
        technicalSkills: {
          primarySkills: [
            { name: 'JavaScript', level: 70 },
            { name: 'React', level: 65 },
            { name: 'Node.js', level: 60 }
          ],
          frameworks: [],
          databases: [],
          tools: [],
          cloudPlatforms: [],
          specializations: []
        },
        stats: {
          totalProjects: 0,
          completedProjects: 0,
          totalEarnings: 0,
          averageRating: 0,
          totalCodeLines: 0,
          activeDays: 0,
          clientRetention: 0,
          totalCommits: 0,
          bugsFixed: 0,
          codeReviewsGiven: 0,
          mentoringSessions: 0
        },
        projects: [],
        recentActivity: [],
        achievements: [],
        notifications: [],
        timeEntries: []
      }
    };

    for (const user of developersWithoutProfiles) {
      const profileExists = await prisma.developerProfile.findUnique({ 
        where: { userId: user.id } 
      });
      
      if (!profileExists && user.developerProfileStatus !== 'rejected') {
        await prisma.developerProfile.create({
          data: {
            userId: user.id,
            ...defaultProfileData,
            data: {
              ...defaultProfileData.data,
              personalInfo: {
                ...defaultProfileData.data.personalInfo,
                firstName: user.firstName || 'Unknown',
                lastName: user.lastName || 'Developer',
                email: user.email || ''
              }
            }
          }
        });
        profilesCreated++;
      }
    }

    console.log(`✅ Created ${profilesCreated} developer profiles`);

    // Step 2: Update user developerProfileStatus to 'approved' for existing developers
    console.log('\n2️⃣ Approving developer profiles...');
    
    // First, find developers that need approval
    const developersNeedingApproval = await prisma.user.findMany({
      where: {
        role: 'developer',
        OR: [
          { developerProfileStatus: 'pending' },
          { developerProfileStatus: { equals: null } }
        ]
      },
      select: { id: true, firstName: true, lastName: true, email: true, developerProfileStatus: true }
    });

    console.log(`Found ${developersNeedingApproval.length} developers needing approval`);
    
    if (developersNeedingApproval.length > 0) {
      console.table(developersNeedingApproval.map(dev => ({
        Name: `${dev.firstName} ${dev.lastName}`,
        Email: dev.email,
        CurrentStatus: dev.developerProfileStatus || 'null'
      })));
    }

    // Update each developer individually to avoid the updateMany issue
    let approvedCount = 0;
    for (const developer of developersNeedingApproval) {
      try {
        await prisma.user.update({
          where: { id: developer.id },
          data: { developerProfileStatus: 'approved' }
        });
        approvedCount++;
      } catch (error) {
        console.error(`Failed to approve developer ${developer.email}:`, error.message);
      }
    }

    console.log(`✅ Approved ${approvedCount} developer profiles`);

    // Step 3: Update developer profile statuses to 'approved' and make them available
    console.log('\n3️⃣ Updating developer profile availability...');
    
    const profilesUpdated = await prisma.developerProfile.updateMany({
      where: {
        OR: [
          { status: 'pending' },
          { isAvailable: false }
        ]
      },
      data: {
        status: 'approved',
        isAvailable: true
      }
    });

    console.log(`✅ Updated ${profilesUpdated.count} developer profiles to available`);

    // Step 4: Verify the fix
    console.log('\n4️⃣ Verifying the fix...');
    
    const availableDevelopers = await prisma.user.findMany({
      where: {
        role: 'developer',
        developerProfileStatus: 'approved'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true
      }
    });

    console.log(`\n🎉 SUCCESS! ${availableDevelopers.length} developers are now available for assignment:`);
    
    if (availableDevelopers.length > 0) {
      console.table(availableDevelopers.map(user => ({
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        Status: user.status
      })));
    }

    console.log('\n✨ Next Steps:');
    console.log('1. Refresh your admin dashboard');
    console.log('2. Navigate to a project and check the assignments tab');
    console.log('3. You should now see available developers for assignment');

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDeveloperVisibility();
