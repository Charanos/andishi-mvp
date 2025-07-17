const { PrismaClient } = require('@prisma/client');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const prisma = new PrismaClient();

async function migrateDeveloperProfiles() {
    console.log('Starting developer profile migration...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('DATABASE_URL found:', process.env.DATABASE_URL.substring(0, 20) + '...');
    
    try {
        // Connect to MongoDB directly
        const client = new MongoClient(process.env.DATABASE_URL);
        await client.connect();
        const db = client.db();
        
        // Get all developer profiles from MongoDB
        const mongoProfiles = await db.collection('developerProfiles').find({}).toArray();
        console.log(`Found ${mongoProfiles.length} developer profiles in MongoDB`);
        
        for (const mongoProfile of mongoProfiles) {
            console.log(`Processing profile: ${mongoProfile._id}`);
            
            let user = null;
            
            // Find the associated user
            if (mongoProfile.userId) {
                // Try to find user by MongoDB ObjectId
                const mongoUser = await db.collection('users').findOne({ _id: mongoProfile.userId });
                
                if (mongoUser && mongoUser.email) {
                    const emailLower = mongoUser.email.toLowerCase();
                    
                    // Check if user exists in Prisma
                    user = await prisma.user.findUnique({
                        where: { email: emailLower }
                    });
                    
                    if (!user) {
                        try {
                            // Create user in Prisma
                            user = await prisma.user.create({
                                data: {
                                    email: emailLower,
                                    firstName: mongoUser.firstName || '',
                                    lastName: mongoUser.lastName || '',
                                    role: 'developer',
                                    status: mongoUser.status || 'pending',
                                    developerProfileStatus: mongoProfile.status || 'pending',
                                    isActive: mongoUser.isActive || false,
                                    accountCreated: mongoUser.accountCreated || false,
                                    passwordGenerated: mongoUser.passwordGenerated || false,
                                    projectCount: mongoUser.projectCount || 0,
                                    progress: mongoUser.progress || 0,
                                    createdAt: mongoUser.createdAt || new Date(),
                                    updatedAt: mongoUser.updatedAt || new Date(),
                                }
                            });
                            console.log(`Created Prisma user: ${user.id}`);
                        } catch (createError) {
                            if (createError.code === 'P2002') {
                                // User already exists, fetch it
                                user = await prisma.user.findUnique({
                                    where: { email: emailLower }
                                });
                                console.log(`User already exists, fetched: ${user?.id}`);
                            } else {
                                throw createError;
                            }
                        }
                    } else {
                        console.log(`Found existing Prisma user: ${user.id}`);
                    }
                } else {
                    console.log(`No user or email found for profile: ${mongoProfile._id}`);
                    // Skip this profile if no user data
                    continue;
                }
            } else {
                console.log(`No userId found for profile: ${mongoProfile._id}`);
                // Skip this profile if no userId
                continue;
            }
            
            if (user) {
                // Check if developer profile exists in Prisma
                const existingProfile = await prisma.developerProfile.findUnique({
                    where: { userId: user.id }
                });
                
                if (!existingProfile) {
                    // Create developer profile in Prisma
                    await prisma.developerProfile.create({
                        data: {
                            userId: user.id,
                            status: mongoProfile.status || 'pending',
                            isAvailable: mongoProfile.isAvailable || false,
                            busyUntilDate: mongoProfile.busyUntilDate || null,
                            data: mongoProfile.data || {},
                            createdAt: mongoProfile.createdAt || new Date(),
                            updatedAt: mongoProfile.updatedAt || new Date(),
                        }
                    });
                    console.log(`Created Prisma developer profile for user: ${user.id}`);
                } else {
                    // Update existing developer profile
                    await prisma.developerProfile.update({
                        where: { id: existingProfile.id },
                        data: {
                            status: mongoProfile.status || existingProfile.status,
                            isAvailable: mongoProfile.isAvailable !== undefined ? mongoProfile.isAvailable : existingProfile.isAvailable,
                            busyUntilDate: mongoProfile.busyUntilDate || existingProfile.busyUntilDate,
                            data: mongoProfile.data || existingProfile.data,
                            updatedAt: new Date(),
                        }
                    });
                    console.log(`Updated Prisma developer profile for user: ${user.id}`);
                }
                
                // Update MongoDB profile to reference the correct Prisma user ID
                await db.collection('developerProfiles').updateOne(
                    { _id: mongoProfile._id },
                    { 
                        $set: { 
                            userId: new ObjectId(user.id),
                            updatedAt: new Date()
                        }
                    }
                );
                console.log(`Updated MongoDB profile to reference Prisma user: ${user.id}`);
            } else {
                console.warn(`Skipping profile ${mongoProfile._id} - no valid user data`);
            }
        }
        
        await client.close();
        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
if (require.main === module) {
    migrateDeveloperProfiles()
        .then(() => {
            console.log('Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateDeveloperProfiles };
