const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseProjectCreation() {
  console.log('🔍 Starting diagnostic for project creation issue...\n');

  // 1. Check database connection
  console.log('1. Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful. Found ${userCount} users.`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }

  // 2. Check for admin user
  console.log('\n2. Checking for admin user...');
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (admin) {
      console.log('✅ Admin user found:', {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName
      });
    } else {
      console.log('❌ No admin user found. This is needed for chat creation.');
    }
  } catch (error) {
    console.error('❌ Error checking for admin:', error.message);
  }

  // 3. Check for existing projects
  console.log('\n3. Checking existing projects...');
  try {
    const projectCount = await prisma.project.count();
    console.log(`✅ Found ${projectCount} projects in database.`);
    
    if (projectCount > 0) {
      const latestProject = await prisma.project.findFirst({
        orderBy: { createdAt: 'desc' }
      });
      console.log('Latest project:', {
        id: latestProject.id,
        title: latestProject.title,
        status: latestProject.status,
        createdAt: latestProject.createdAt
      });
    }
  } catch (error) {
    console.error('❌ Error checking projects:', error.message);
  }

  // 4. Test project creation with minimal data
  console.log('\n4. Testing minimal project creation...');
  try {
    // First, find or create a test client user
    const testUser = await prisma.user.upsert({
      where: { email: 'test-client@example.com' },
      update: {},
      create: {
        email: 'test-client@example.com',
        firstName: 'Test',
        lastName: 'Client',
        role: 'client',
        isActive: true
      }
    });
    console.log('✅ Test user ready:', testUser.id);

    // Create a test project
    const testProject = await prisma.project.create({
      data: {
        title: 'Test Project - ' + new Date().toISOString(),
        description: 'This is a test project created by diagnostic script',
        status: 'pending',
        priority: 'medium',
        budget: 0,
        timeline: '1 month',
        techStack: ['JavaScript', 'Node.js'],
        requiredSkills: [],
        experienceLevel: 'Mid-level',
        maxTeamSize: 1,
        clientId: testUser.id,
        milestones: [],
        updates: [],
        files: [],
        payments: []
      }
    });
    
    console.log('✅ Test project created successfully:', {
      id: testProject.id,
      title: testProject.title
    });

    // Clean up test project
    await prisma.project.delete({ where: { id: testProject.id } });
    console.log('✅ Test project cleaned up');
    
  } catch (error) {
    console.error('❌ Failed to create test project:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
  }

  // 5. Check schema validation
  console.log('\n5. Checking project data structure...');
  const sampleProjectData = {
    title: 'Sample Project',
    description: 'A sample project for testing',
    category: 'Web Development',
    timeline: '3 months',
    priority: 'medium',
    techStack: ['React', 'Node.js'],
    requirements: 'Need experienced developers',
    pricing: {
      type: 'fixed',
      currency: 'USD',
      fixedBudget: '5000'
    },
    userInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'client'
    }
  };
  
  console.log('Sample project data structure:');
  console.log(JSON.stringify(sampleProjectData, null, 2));

  // Disconnect
  await prisma.$disconnect();
  console.log('\n✅ Diagnostic complete!');
}

diagnoseProjectCreation()
  .catch(error => {
    console.error('\n❌ Diagnostic failed:', error);
    process.exit(1);
  });
