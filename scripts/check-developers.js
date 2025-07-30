const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkDevelopers() {
  try {
    console.log('🔍 Checking developer profiles in database...');
    
    // Check users
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'amina.diallo@techafrique.io',
            'chi.okoye@naijatech.dev',
            'sipho.maseko@capetowndevs.co.za'
          ]
        }
      }
    });
    
    console.log(`\n👥 Found ${users.length} developer users:`);
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - Status: ${user.status}`);
    });
    
    // Check developer profiles
    const profiles = await prisma.developerProfile.findMany({
      where: {
        userId: {
          in: users.map(u => u.id)
        }
      }
    });
    
    console.log(`\n📋 Found ${profiles.length} developer profiles:`);
    profiles.forEach(profile => {
      const user = users.find(u => u.id === profile.userId);
      console.log(`  - ${user?.firstName} ${user?.lastName} (${profile.status}) - Available: ${profile.isAvailable}`);
      
      // Show some profile data
      if (profile.data && typeof profile.data === 'object') {
        console.log(`    ID: ${profile.data.id}`);
        console.log(`    Title: ${profile.data.professionalInfo?.title}`);
        console.log(`    Location: ${profile.data.personalInfo?.location}`);
      }
    });
    
    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Error checking developers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDevelopers();
