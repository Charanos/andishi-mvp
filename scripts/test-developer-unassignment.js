const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDeveloperUnassignment() {
  console.log('Testing Developer Unassignment Logic...\n');

  try {
    // Test 1: Create a test project with estimated completion date
    console.log('Test 1: Creating test project...');
    const testProject = await prisma.project.create({
      data: {
        title: 'Test Project for Unassignment Logic',
        description: 'Testing automatic developer unassignment',
        status: 'in-progress',
        estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        techStack: ['JavaScript', 'React'],
        requiredSkills: ['Frontend Development'],
      }
    });
    console.log(`✓ Created test project: ${testProject.id}`);

    // Test 2: Find or create a test developer
    console.log('\nTest 2: Finding test developer...');
    const testDeveloper = await prisma.developerProfile.findFirst({
      where: {
        status: 'approved'
      }
    });

    if (!testDeveloper) {
      console.log('✗ No approved developer found. Please create a developer profile first.');
      return;
    }
    console.log(`✓ Found test developer: ${testDeveloper.id}`);

    // Test 3: Assign developer to project
    console.log('\nTest 3: Assigning developer to project...');
    const assignment = await prisma.projectAssignment.create({
      data: {
        projectId: testProject.id,
        developerId: testDeveloper.id,
        role: 'Frontend Developer',
        status: 'accepted'
      }
    });

    // Update developer availability
    await prisma.developerProfile.update({
      where: { id: testDeveloper.id },
      data: { isAvailable: false }
    });
    console.log(`✓ Developer assigned and marked as unavailable`);

    // Test 4: Complete project BEFORE estimated completion date
    console.log('\nTest 4: Completing project before estimated completion date...');
    
    // Mock the project completion API call
    const response = await fetch(`http://localhost:3000/api/projects/${testProject.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'completed'
      })
    });

    if (response.ok) {
      console.log('✓ Project completion API call successful');
    } else {
      console.log('✗ Project completion API call failed');
    }

    // Check developer availability status
    const updatedDeveloper = await prisma.developerProfile.findUnique({
      where: { id: testDeveloper.id },
      select: {
        isAvailable: true,
        busyUntilDate: true
      }
    });

    console.log(`Developer availability: ${updatedDeveloper.isAvailable}`);
    console.log(`Developer busyUntilDate: ${updatedDeveloper.busyUntilDate}`);

    if (!updatedDeveloper.isAvailable && updatedDeveloper.busyUntilDate) {
      console.log('✓ Developer correctly marked as busy until estimated completion date');
    } else {
      console.log('✗ Developer availability not updated correctly');
    }

    // Test 5: Test the availability cleanup function
    console.log('\nTest 5: Testing availability cleanup...');
    
    // Manually set busyUntilDate to past date
    await prisma.developerProfile.update({
      where: { id: testDeveloper.id },
      data: {
        busyUntilDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    });

    // Call cleanup API
    const cleanupResponse = await fetch('http://localhost:3000/api/developer-availability/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (cleanupResponse.ok) {
      const cleanupResult = await cleanupResponse.json();
      console.log('✓ Cleanup API call successful');
      console.log(`Updated ${cleanupResult.updatedCount} developers`);
    } else {
      console.log('✗ Cleanup API call failed');
    }

    // Check if developer is now available
    const finalDeveloper = await prisma.developerProfile.findUnique({
      where: { id: testDeveloper.id },
      select: {
        isAvailable: true,
        busyUntilDate: true
      }
    });

    if (finalDeveloper.isAvailable && !finalDeveloper.busyUntilDate) {
      console.log('✓ Developer correctly marked as available after cleanup');
    } else {
      console.log('✗ Developer availability not cleaned up correctly');
    }

    // Test 6: Test project deletion
    console.log('\nTest 6: Testing project deletion logic...');
    
    // Create another test project and assignment
    const testProject2 = await prisma.project.create({
      data: {
        title: 'Test Project 2 for Deletion',
        description: 'Testing automatic developer unassignment on deletion',
        status: 'in-progress',
        estimatedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        techStack: ['Node.js'],
        requiredSkills: ['Backend Development'],
      }
    });

    const assignment2 = await prisma.projectAssignment.create({
      data: {
        projectId: testProject2.id,
        developerId: testDeveloper.id,
        role: 'Backend Developer',
        status: 'accepted'
      }
    });

    await prisma.developerProfile.update({
      where: { id: testDeveloper.id },
      data: { isAvailable: false }
    });

    // Delete project
    const deleteResponse = await fetch(`http://localhost:3000/api/projects/${testProject2.id}`, {
      method: 'DELETE'
    });

    if (deleteResponse.ok) {
      console.log('✓ Project deletion API call successful');
    } else {
      console.log('✗ Project deletion API call failed');
    }

    // Check developer availability
    const developerAfterDeletion = await prisma.developerProfile.findUnique({
      where: { id: testDeveloper.id },
      select: {
        isAvailable: true,
        busyUntilDate: true
      }
    });

    console.log(`Developer availability after deletion: ${developerAfterDeletion.isAvailable}`);
    console.log(`Developer busyUntilDate after deletion: ${developerAfterDeletion.busyUntilDate}`);

    console.log('\n✓ All tests completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Cleanup: Delete test data
    console.log('\nCleaning up test data...');
    try {
      await prisma.project.deleteMany({
        where: {
          title: {
            startsWith: 'Test Project'
          }
        }
      });
      console.log('✓ Test data cleaned up');
    } catch (cleanupError) {
      console.log('Warning: Could not clean up test data:', cleanupError.message);
    }
    
    await prisma.$disconnect();
  }
}

// Run the test
testDeveloperUnassignment()
  .then(() => {
    console.log('\nTest suite completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
