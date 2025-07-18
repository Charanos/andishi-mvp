// scripts/prisma-smoke.js
// Quick smoke test to verify basic Prisma queries run without error.
// Logs counts for key tables.

const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.count();
    const projects = await prisma.project.count();
    const developers = await prisma.developer.count();
    const developerProfiles = await prisma.developerProfile.count();
    const projectAssignments = await prisma.projectAssignment.count();

    console.log('Prisma smoke-test results:');
    console.table({ users, developerProfiles, projectAssignments, projects, developers });
  } catch (error) {
    console.error('Prisma smoke-test failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
