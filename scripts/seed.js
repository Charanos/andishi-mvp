const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    console.error('DATABASE_URL env var not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    // Clear existing
    await users.deleteMany({});

    // Seed sample users
    const passwordHash = await bcrypt.hash('password123', 10);

    await users.insertMany([
      {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        password: passwordHash,
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      },
      {
        id: '2',
        email: 'client@test.com',
        name: 'Client User',
        role: 'client',
        password: passwordHash,
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      },
      {
        id: '3',
        email: 'dev@test.com',
        name: 'Developer User',
        role: 'developer',
        password: passwordHash,
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      },
    ]);

    console.log('Database seeded ✅');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run();
