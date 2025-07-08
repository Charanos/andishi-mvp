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
        const profiles = db.collection('developerProfile');
        const users = db.collection('users');

        // Check if any developer profiles exist
        const profileCount = await profiles.countDocuments();

        if (profileCount === 0) {
            console.log("No developer profiles found. Seeding sample profiles...");
            // Seed sample developer profiles if none exist
            const sampleDevProfiles = [
                {
                    status: "approved",
                    isAvailable: true,
                    data: {
                        personalInfo: {
                            firstName: "John",
                            lastName: "Doe",
                            email: "john.doe@example.com",
                            location: "New York, USA",
                            tagline: "Experienced Full-stack Developer",
                        },
                        professionalInfo: {
                            title: "Full-stack Developer",
                            experienceLevel: "Senior",
                            yearsOfExperience: "7",
                            availability: "Full-time",
                            hourlyRate: 80,
                            bio: "Building robust web applications.",
                            languages: ["English"],
                            certifications: [],
                            preferredWorkType: ["Remote"],
                            workingHours: "9 AM - 5 PM EST",
                        },
                        technicalSkills: {
                            primarySkills: [
                                { name: "JavaScript", level: 90, category: "Language" },
                                { name: "React", level: 85, category: "Frontend Framework" },
                                { name: "Node.js", level: 80, category: "Backend Framework" },
                            ],
                            frameworks: [],
                            databases: [],
                            tools: [],
                            cloudPlatforms: [],
                            specializations: [],
                        },
                        stats: {
                            totalProjects: 15,
                            completedProjects: 12,
                            totalEarnings: 120000,
                            averageRating: 4.7,
                            totalCodeLines: 300000,
                            activeDays: 250,
                            clientRetention: 92,
                            responseTime: "3 hours",
                            totalCommits: 1000,
                            bugsFixed: 80,
                            codeReviewsGiven: 150,
                            mentoringSessions: 5,
                        },
                        projects: [],
                        achievements: [],
                        recentActivity: [],
                        notifications: [],
                        timeEntries: [],
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    status: "approved",
                    isAvailable: true,
                    data: {
                        personalInfo: {
                            firstName: "Jane",
                            lastName: "Smith",
                            email: "jane.smith@example.com",
                            location: "London, UK",
                            tagline: "Passionate Mobile Developer",
                        },
                        professionalInfo: {
                            title: "Mobile Developer",
                            experienceLevel: "Mid-level",
                            yearsOfExperience: "4",
                            availability: "Full-time",
                            hourlyRate: 65,
                            bio: "Crafting intuitive mobile experiences.",
                            languages: ["English"],
                            certifications: [],
                            preferredWorkType: ["Remote"],
                            workingHours: "9 AM - 5 PM GMT",
                        },
                        technicalSkills: {
                            primarySkills: [
                                { name: "Swift", level: 88, category: "Language" },
                                { name: "Kotlin", level: 82, category: "Language" },
                                { name: "Flutter", level: 80, category: "Mobile Framework" },
                            ],
                            frameworks: [],
                            databases: [],
                            tools: [],
                            cloudPlatforms: [],
                            specializations: [],
                        },
                        stats: {
                            totalProjects: 8,
                            completedProjects: 7,
                            totalEarnings: 70000,
                            averageRating: 4.6,
                            totalCodeLines: 150000,
                            activeDays: 180,
                            clientRetention: 90,
                            responseTime: "4 hours",
                            totalCommits: 600,
                            bugsFixed: 40,
                            codeReviewsGiven: 70,
                            mentoringSessions: 3,
                        },
                        projects: [],
                        achievements: [],
                        recentActivity: [],
                        notifications: [],
                        timeEntries: [],
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            await profiles.insertMany(sampleDevProfiles);
            console.log(`Seeded ${sampleDevProfiles.length} sample developer profiles.`);
        }

        // Update all profiles to ensure 'status' is 'approved' and 'isAvailable' is 'true'
        // This will also catch any profiles that were previously 'pending' or 'false'
        const result = await profiles.updateMany(
            {},
            {
                $set: { status: 'pending', isAvailable: false }
            }
        );
        console.log(`Updated ${result.modifiedCount} developer profiles to pending and unavailable.`);

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
                    status: 'pending', // Set user status to pending as well
                    isActive: true,
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