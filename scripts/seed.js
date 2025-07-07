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
    const developerProfiles = db.collection('developerProfile');

    // Patch existing developer profiles to ensure status and isAvailable are set
    await developerProfiles.updateMany(
      { $or: [{ status: { $exists: false } }, { isAvailable: { $exists: false } }] },
      { $set: { status: "pending", isAvailable: false } }
    );

    // Clear existing
    await users.deleteMany({});

    // Seed sample users
    const passwordHash1 = await bcrypt.hash('oyvJ0S+DVPuK', 10);
    const passwordHash2 = await bcrypt.hash('u15r4ge63RKt', 10);
    const passwordHash3 = await bcrypt.hash('XGyZ5DA@YPiv', 10);
    const passwordHash4 = await bcrypt.hash('N5R9nqMX!Vv1', 10);
    const passwordHash5 = await bcrypt.hash('EhmmK4vNQ$%D', 10);

    await users.insertMany([
      {
        id: '1',
        email: 'dennis@andishi.dev',
        name: 'Dennis Munge',
        role: 'admin',
        password: passwordHash1,
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      },
      {
        id: '2',
        email: 'ian@andishi.dev',
        name: 'Ian Mwangi',
        role: 'admin',
        password: passwordHash2,
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      },
      {
        id: '3',
        email: 'yvette@andishi.dev',
        name: 'Yvette Asewe',
        role: 'admin',
        password: passwordHash3,
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      },
      {
        id: '4',
        email: 'eric@andishi.dev',
        name: 'Eric Kibuchi',
        role: 'admin',
        password: passwordHash4,
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        lastLogin: null,
      },
      {
        id: '5',
        email: 'isaac@andishi.dev',
        name: 'Isaac John',
        role: 'admin',
        password: passwordHash5,
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
