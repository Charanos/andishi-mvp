/**
 * Diagnostic Script: Developer Visibility in Admin Dashboard
 * 
 * This script helps diagnose why available developers aren't showing up
 * in the assignments tab of the admin dashboard.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseDeveloperVisibility() {
  console.log('🔍 Diagnosing Developer Visibility Issues...\n');

  try {
    // 1. Check total users in database
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total users in database: ${totalUsers}`);

    // 2. Check users with developer role
    const developerUsers = await prisma.user.findMany({
      where: { role: 'developer' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        developerProfileStatus: true,
        status: true,
        createdAt: true
      }
    });

    console.log(`\n👨‍💻 Users with developer role: ${developerUsers.length}`);
    
    if (developerUsers.length > 0) {
      console.log('\nDeveloper Users Details:');
      console.table(developerUsers.map(user => ({
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        ProfileStatus: user.developerProfileStatus || 'null',
        UserStatus: user.status,
        CreatedAt: user.createdAt.toISOString().split('T')[0]
      })));
    }

    // 3. Check approved developers (what should show in assignments)
    const approvedDevelopers = await prisma.user.findMany({
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

    console.log(`\n✅ Approved developers (should show in assignments): ${approvedDevelopers.length}`);
    
    if (approvedDevelopers.length > 0) {
      console.log('\nApproved Developers:');
      console.table(approvedDevelopers.map(user => ({
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        Status: user.status
      })));
    } else {
      console.log('❌ No approved developers found! This is likely the issue.');
    }

    // 4. Check developer profiles
    const developerProfiles = await prisma.developerProfile.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            developerProfileStatus: true
          }
        }
      }
    });

    console.log(`\n📋 Developer profiles in database: ${developerProfiles.length}`);
    
    if (developerProfiles.length > 0) {
      console.log('\nDeveloper Profiles Status:');
      console.table(developerProfiles.map(profile => ({
        Name: `${profile.user?.firstName || 'Unknown'} ${profile.user?.lastName || 'User'}`,
        Email: profile.user?.email || 'No email',
        ProfileStatus: profile.status,
        IsAvailable: profile.isAvailable,
        UserProfileStatus: profile.user?.developerProfileStatus || 'null'
      })));
    }

    // 5. Check for mismatched statuses
    const mismatchedStatuses = await prisma.user.findMany({
      where: {
        role: 'developer',
        OR: [
          { developerProfileStatus: null },
          { developerProfileStatus: 'pending' }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        developerProfileStatus: true
      }
    });

    if (mismatchedStatuses.length > 0) {
      console.log(`\n⚠️  Developers with pending/null profile status: ${mismatchedStatuses.length}`);
      console.log('These developers won\'t show in assignments until approved.');
      console.table(mismatchedStatuses.map(user => ({
        Name: `${user.firstName} ${user.lastName}`,
        Email: user.email,
        ProfileStatus: user.developerProfileStatus || 'null'
      })));
    }

    // 6. Check project assignments
    const assignments = await prisma.projectAssignment.findMany({
      include: {
        project: {
          select: { title: true }
        }
      }
    });

    console.log(`\n📌 Current project assignments: ${assignments.length}`);
    
    if (assignments.length > 0) {
      console.log('\nCurrent Assignments:');
      console.table(assignments.map(assignment => ({
        ProjectTitle: assignment.project?.title || 'Unknown Project',
        DeveloperId: assignment.developerId,
        Status: assignment.status,
        AssignedAt: assignment.assignedAt.toISOString().split('T')[0]
      })));
    }

    // 7. Provide recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    
    if (approvedDevelopers.length === 0) {
      console.log('1. ❌ No approved developers found. You need to:');
      console.log('   - Approve developer profiles in the admin dashboard');
      console.log('   - Or run the sync script to create missing profiles');
    }
    
    if (mismatchedStatuses.length > 0) {
      console.log('2. ⚠️  Some developers have pending/null profile status:');
      console.log('   - Review and approve these developers in the admin dashboard');
      console.log('   - Or use the bulk approval script below');
    }

    if (developerProfiles.length === 0) {
      console.log('3. 📋 No developer profiles found:');
      console.log('   - Run the profile sync API: GET /api/developer-profiles?action=sync');
    }

    console.log('\n✨ Quick Fix Commands:');
    console.log('1. Sync developer profiles: curl "http://localhost:3000/api/developer-profiles?action=sync"');
    console.log('2. Bulk approve all pending developers (run the fix script below)');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnosis
diagnoseDeveloperVisibility();
