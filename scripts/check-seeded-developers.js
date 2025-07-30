const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSeededDevelopers() {
  try {
    console.log('🔍 Checking for seeded developers (Amina, Chiamaka, Sipho):');
    
    // Check specifically for the seeded developers
    const seededEmails = [
      'amina.diallo@techafrique.io',
      'chi.okoye@naijatech.dev',
      'sipho.maseko@capetowndevs.co.za'
    ];
    
    let foundCount = 0;
    
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
        foundCount++;
        console.log(`\n  ✅ Found seeded user: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`    User ID: ${user.id}`);
        console.log(`    User Status: ${user.status}`);
        
        if (user.developerProfile) {
          console.log(`    Profile ID: ${user.developerProfile.id}`);
          console.log(`    Profile Status: ${user.developerProfile.status}`);
          console.log(`    Is Available: ${user.developerProfile.isAvailable}`);
          
          // Try to parse profile data
          try {
            if (user.developerProfile.data) {
              const data = user.developerProfile.data;
              console.log(`    First Name: ${data.personalInfo?.firstName || data.personalInfo?.name || 'N/A'}`);
              console.log(`    Last Name: ${data.personalInfo?.lastName || 'N/A'}`);
              console.log(`    Title: ${data.professionalInfo?.title || 'N/A'}`);
              console.log(`    Location: ${data.personalInfo?.location || 'N/A'}`);
            }
          } catch (e) {
            console.log(`    Profile data parsing error: ${e.message}`);
          }
        } else {
          console.log(`    No developer profile found`);
        }
      } else {
        console.log(`\n  ❌ Seeded user with email ${email} NOT FOUND`);
      }
    }
    
    console.log(`\n📊 Summary: Found ${foundCount} out of 3 seeded developers`);
    
    if (foundCount === 3) {
      console.log('🎉 All seeded developers are present in the database!');
    } else {
      console.log('⚠️ Some seeded developers are missing from the database.');
    }
    
  } catch (error) {
    console.error('Error during seeded developers check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSeededDevelopers();
