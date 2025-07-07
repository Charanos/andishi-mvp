// Script to update all developer profiles in MongoDB to ensure 'status' and 'isAvailable' fields exist and are set to defaults if missing.
// Usage: Run with `node scripts/fixDeveloperProfiles.js` (after setting up your environment)

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.DATABASE_URL;

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const profiles = db.collection('developerProfiles');
        const users = db.collection('users');

        // Update all profiles missing 'status' or 'isAvailable'
        const result = await profiles.updateMany(
            {
                $or: [
                    { status: { $exists: false } },
                    { isAvailable: { $exists: false } }
                ]
            },
            {
                $set: { status: 'pending', isAvailable: false }
            }
        );
        console.log(`Updated ${result.modifiedCount} developer profiles.`);

        // Seed users from developer profiles if not already present
        const devProfiles = await profiles.find({}).toArray();
        let createdCount = 0;
        for (const profile of devProfiles) {
            const email = profile.data?.personalInfo?.email;
            if (!email) continue;
            const existingUser = await users.findOne({ email });
            if (!existingUser) {
                const userDoc = {
                    email,
                    firstName: profile.data.personalInfo.firstName || '',
                    lastName: profile.data.personalInfo.lastName || '',
                    role: 'developer',
                    status: 'pending',
                    isActive: false,
                    password: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                await users.insertOne(userDoc);
                createdCount++;
            }
        }
        console.log(`Seeded ${createdCount} users from developer profiles.`);
    } catch (err) {
        console.error('Error updating developer profiles or seeding users:', err);
    } finally {
        await client.close();
    }
}

main();
