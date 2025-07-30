const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function comprehensiveCheck() {
  try {
    console.log('🔍 Comprehensive Database Check');
    console.log('================================');
    
    // Fetch all users with developer role
    const users = await prisma.user.findMany({
      where: {
        role: 'developer'
      }
    });
    
    console.log(`\n👥 Found ${users.length} users with developer role:`);
    
    for (const user of users) {
      console.log(`\n  User: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`    ID: ${user.id}`);
      console.log(`    Status: ${user.status}`);
      console.log(`    Created: ${user.createdAt}`);
      
      // Check if they have a developer profile
      const profile = await prisma.developerProfile.findUnique({
        where: {
          userId: user.id
        }
      });
      
      if (profile) {
        console.log(`    Profile ID: ${profile.id}`);
        console.log(`    Profile Status: ${profile.status}`);
        console.log(`    Is Available: ${profile.isAvailable}`);
        
        // Try to parse profile data
        try {
          if (profile.data) {
            const data = profile.data;
            console.log(`    First Name: ${data.personalInfo?.firstName || 'N/A'}`);
            console.log(`    Last Name: ${data.personalInfo?.lastName || 'N/A'}`);
            console.log(`    Title: ${data.professionalInfo?.title || 'N/A'}`);
          }
        } catch (e) {
          console.log(`    Profile data parsing error: ${e.message}`);
        }
      } else {
        console.log(`    No developer profile found`);
      }
    }
    
    // Also fetch all developer profiles regardless of user
    const allProfiles = await prisma.developerProfile.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`\n📋 Found ${allProfiles.length} total developer profiles:`);
    
    for (const profile of allProfiles) {
      console.log(`\n  Profile: ${profile.user?.firstName || 'No User'} ${profile.user?.lastName || ''} (${profile.user?.email || 'No Email'})`);
      console.log(`    Profile ID: ${profile.id}`);
      console.log(`    User ID: ${profile.userId}`);
      console.log(`    Status: ${profile.status}`);
      console.log(`    Is Available: ${profile.isAvailable}`);
      
      // Try to parse profile data
      try {
        if (profile.data) {
          const data = profile.data;
          console.log(`    First Name: ${data.personalInfo?.firstName || 'N/A'}`);
          console.log(`    Last Name: ${data.personalInfo?.lastName || 'N/A'}`);
          console.log(`    Title: ${data.professionalInfo?.title || 'N/A'}`);
        }
      } catch (e) {
        console.log(`    Profile data parsing error: ${e.message}`);
      }
    }
    
    // Check specifically for the seeded developers
    console.log('\n🔍 Checking for seeded developers (Alex, Maria, James):');
    
    const seededEmails = [
      'alex.chen@example.com',
      'maria.rodriguez@example.com',
      'james.wilson@example.com'
    ];
    
    for (const email of seededEmails) {
      const user = await prisma.user.findUnique({
        where: {
          email: email
        },
        include: {
          developerProfile: true
        }
      });
      
      if (user) {
        console.log(`\n  Found seeded user: ${user.firstName} ${user.lastName} (${user.email})`);
        if (user.developerProfile) {
          console.log(`    Has profile: ${user.developerProfile.id}`);
          console.log(`    Profile Status: ${user.developerProfile.status}`);
        } else {
          console.log(`    No developer profile found`);
        }
      } else {
        console.log(`\n  Seeded user with email ${email} NOT FOUND`);
      }
    }
    
  } catch (error) {
    console.error('Error during comprehensive check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveCheck();
