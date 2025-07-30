const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDeveloperApi() {
  try {
    // Fetch all developer profiles directly from database
    const profiles = await prisma.developerProfile.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`Found ${profiles.length} developer profiles:`);
    
    profiles.forEach((profile, index) => {
      console.log(`\nProfile ${index + 1}:`);
      console.log(`  ID: ${profile.id}`);
      console.log(`  User ID: ${profile.userId}`);
      console.log(`  Status: ${profile.status}`);
      console.log(`  Is Available: ${profile.isAvailable}`);
      console.log(`  User Email: ${profile.user?.email || 'No user found'}`);
      console.log(`  User Role: ${profile.user?.role || 'No user found'}`);
      
      // Check if data field exists and has content
      if (profile.data) {
        try {
          const data = profile.data;
          console.log(`  First Name: ${data.personalInfo?.firstName || 'N/A'}`);
          console.log(`  Last Name: ${data.personalInfo?.lastName || 'N/A'}`);
          console.log(`  Title: ${data.professionalInfo?.title || 'N/A'}`);
        } catch (e) {
          console.log(`  Data parsing error: ${e.message}`);
        }
      } else {
        console.log(`  No data field found`);
      }
    });
    
  } catch (error) {
    console.error('Error fetching developer profiles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeveloperApi();
