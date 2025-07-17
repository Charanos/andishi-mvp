const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupOrphanedProfiles() {
    console.log('Starting orphaned profile cleanup...');
    
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
        
        let orphanedCount = 0;
        const orphanedProfiles = [];
        
        for (const mongoProfile of mongoProfiles) {
            if (!mongoProfile.userId) {
                console.log(`Profile ${mongoProfile._id} has no userId - marking for deletion`);
                orphanedProfiles.push(mongoProfile._id);
                orphanedCount++;
                continue;
            }
            
            // Check if the associated user exists
            const mongoUser = await db.collection('users').findOne({ _id: mongoProfile.userId });
            
            if (!mongoUser) {
                console.log(`Profile ${mongoProfile._id} has no associated user - marking for deletion`);
                orphanedProfiles.push(mongoProfile._id);
                orphanedCount++;
                continue;
            }
            
            if (!mongoUser.email) {
                console.log(`Profile ${mongoProfile._id} has user with no email - marking for deletion`);
                orphanedProfiles.push(mongoProfile._id);
                orphanedCount++;
                continue;
            }
        }
        
        console.log(`Found ${orphanedCount} orphaned profiles to delete`);
        
        if (orphanedCount > 0) {
            // Delete orphaned profiles
            const deleteResult = await db.collection('developerProfiles').deleteMany({
                _id: { $in: orphanedProfiles }
            });
            
            console.log(`Deleted ${deleteResult.deletedCount} orphaned profiles`);
        }
        
        await client.close();
        console.log('Cleanup completed successfully!');
        
    } catch (error) {
        console.error('Cleanup failed:', error);
        throw error;
    }
}

// Run the cleanup
if (require.main === module) {
    cleanupOrphanedProfiles()
        .then(() => {
            console.log('Cleanup script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Cleanup script failed:', error);
            process.exit(1);
        });
}

module.exports = { cleanupOrphanedProfiles };
