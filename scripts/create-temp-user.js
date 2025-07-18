const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createTempUser() {
  const email = 'tempuser@example.com'; // Change this to your desired email
  const password = 'password123'; // Change this to your desired password

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        firstName: 'Temp',
        lastName: 'User',
        role: 'admin', // Or 'developer', depending on what you need
        isActive: true,
        accountCreated: true,
        passwordGenerated: true,
      },
    });
    console.log(`Successfully created temporary user: ${user.email}`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error(`User with email ${email} already exists.`);
    } else {
      console.error('Error creating temporary user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTempUser();
