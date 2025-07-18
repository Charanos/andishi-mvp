const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
  try {
    // Clear existing developer profiles first to avoid foreign key constraint issues
    await prisma.developerProfile.deleteMany({});
    console.log('Cleared existing developer profiles.');

    // Clear existing users
    await prisma.user.deleteMany({});
    console.log('Cleared existing users.');

    // Seed sample users
    const usersToCreate = [
      {
        email: 'dennis@andishi.dev',
        firstName: 'Dennis',
        lastName: 'Munge',
        role: 'admin',
        password: await bcrypt.hash('oyvJ0S+DVPuK', 10),
        isActive: true,
        accountCreated: true,
        passwordGenerated: true,
      },
      {
        email: 'ian@andishi.dev',
        firstName: 'Ian',
        lastName: 'Mwangi',
        role: 'admin',
        password: await bcrypt.hash('u15r4ge63RKt', 10),
        isActive: true,
        accountCreated: true,
        passwordGenerated: true,
      },
      {
        email: 'yvette@andishi.dev',
        firstName: 'Yvette',
        lastName: 'Asewe',
        role: 'admin',
        password: await bcrypt.hash('XGyZ5DA@YPiv', 10),
        isActive: true,
        accountCreated: true,
        passwordGenerated: true,
      },
      {
        email: 'eric@andishi.dev',
        firstName: 'Eric',
        lastName: 'Kibuchi',
        role: 'admin',
        password: await bcrypt.hash('N5R9nqMX!Vv1', 10),
        isActive: true,
        accountCreated: true,
        passwordGenerated: true,
      },
      {
        email: 'isaac@andishi.dev',
        firstName: 'Isaac',
        lastName: 'John',
        role: 'admin',
        password: await bcrypt.hash('EhmmK4vNQ$%D', 10),
        isActive: true,
        accountCreated: true,
        passwordGenerated: true,
      },
      {
        email: 'jojocarter@gmail.com',
        firstName: 'Jordan',
        lastName: 'Carter',
        role: 'developer',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        accountCreated: true,
        passwordGenerated: true,
      },
      {
        email: 'gideonkngetich86@gmail.com',
        firstName: 'Gideon',
        lastName: 'Ngetich',
        role: 'developer',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        accountCreated: true,
        passwordGenerated: true,
      },
    ];

    for (const userData of usersToCreate) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData,
      });
    }

    console.log('Users seeded ✅');

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
