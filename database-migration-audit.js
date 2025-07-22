const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');

// Comprehensive Database Migration Audit Script
async function auditDatabaseMigration() {
    console.log('🔍 DATABASE MIGRATION AUDIT - Comprehensive Analysis\n');
    
    // 1. Environment Variables Check
    console.log('=== 1. ENVIRONMENT VARIABLES AUDIT ===');
    const envVars = {
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_URI: process.env.DATABASE_URI,
        MONGODB_URI: process.env.MONGODB_URI,
        NODE_ENV: process.env.NODE_ENV
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
        if (value) {
            // Extract database name from connection string
            const dbMatch = value.match(/\/([^?]+)\?/);
            const dbName = dbMatch ? dbMatch[1] : 'unknown';
            console.log(`✅ ${key}: Connected to database "${dbName}"`);
        } else {
            console.log(`❌ ${key}: Not set`);
        }
    });
    
    if (!envVars.DATABASE_URL) {
        console.error('\n🚨 CRITICAL: DATABASE_URL not found - Prisma cannot connect!');
        return;
    }
    
    // 2. Prisma Connection Test
    console.log('\n=== 2. PRISMA CONNECTION TEST ===');
    let prisma;
    try {
        prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
        
        console.log('🔍 Testing Prisma connection...');
        await prisma.$connect();
        console.log('✅ Prisma connection successful');
        
        // Test basic query
        const userCount = await prisma.user.count();
        console.log(`✅ User count: ${userCount}`);
        
        const projectCount = await prisma.project.count();
        console.log(`✅ Project count: ${projectCount}`);
        
        const developerProfileCount = await prisma.developerProfile.count();
        console.log(`✅ Developer profiles: ${developerProfileCount}`);
        
    } catch (error) {
        console.error('❌ Prisma connection failed:', error.message);
        
        if (error.message.includes('authentication')) {
            console.log('💡 Suggestion: Check MongoDB credentials in DATABASE_URL');
        } else if (error.message.includes('timeout')) {
            console.log('💡 Suggestion: Check network connectivity to MongoDB Atlas');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Suggestion: Check MongoDB cluster hostname in DATABASE_URL');
        }
    }
    
    // 3. Native MongoDB Connection Test (for comparison)
    console.log('\n=== 3. NATIVE MONGODB CONNECTION TEST ===');
    try {
        const client = new MongoClient(envVars.DATABASE_URL, {
            serverSelectionTimeoutMS: 10000,
        });
        
        await client.connect();
        console.log('✅ Native MongoDB connection successful');
        
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log(`✅ Collections found: ${collections.length}`);
        
        // Check specific collections
        const expectedCollections = ['User', 'Project', 'DeveloperProfile', 'ProjectAssignment', 'ProjectChat'];
        for (const collName of expectedCollections) {
            const count = await db.collection(collName).countDocuments();
            console.log(`  - ${collName}: ${count} documents`);
        }
        
        await client.close();
        
    } catch (error) {
        console.error('❌ Native MongoDB connection failed:', error.message);
    }
    
    // 4. Schema Validation
    console.log('\n=== 4. PRISMA SCHEMA VALIDATION ===');
    try {
        // Test each model individually
        const models = [
            { name: 'User', query: () => prisma.user.findFirst() },
            { name: 'Project', query: () => prisma.project.findFirst() },
            { name: 'DeveloperProfile', query: () => prisma.developerProfile.findFirst() },
            { name: 'ProjectAssignment', query: () => prisma.projectAssignment.findFirst() },
            { name: 'ProjectChat', query: () => prisma.projectChat.findFirst() }
        ];
        
        for (const model of models) {
            try {
                const result = await model.query();
                console.log(`✅ ${model.name} model: Working ${result ? '(has data)' : '(empty but accessible)'}`);
            } catch (error) {
                console.error(`❌ ${model.name} model: ${error.message}`);
                
                if (error.message.includes('does not exist')) {
                    console.log(`💡 Collection "${model.name}" missing in database`);
                } else if (error.message.includes('Invalid field')) {
                    console.log(`💡 Schema mismatch in ${model.name} model`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Schema validation failed:', error.message);
    }
    
    // 5. Authentication Test
    console.log('\n=== 5. AUTHENTICATION FLOW TEST ===');
    try {
        // Test user lookup (common auth operation)
        const testEmail = 'admin@andishi.dev'; // Adjust as needed
        const user = await prisma.user.findUnique({
            where: { email: testEmail },
            include: { developerProfile: true }
        });
        
        if (user) {
            console.log(`✅ User lookup successful: ${user.email} (${user.role})`);
            console.log(`  - Profile exists: ${!!user.developerProfile}`);
            console.log(`  - Account status: ${user.status}`);
        } else {
            console.log(`⚠️  Test user not found: ${testEmail}`);
            
            // Check if any users exist
            const anyUser = await prisma.user.findFirst();
            if (anyUser) {
                console.log(`✅ Database has users, test email just doesn't exist`);
            } else {
                console.log(`❌ No users found in database - data migration issue?`);
            }
        }
        
    } catch (error) {
        console.error('❌ Authentication test failed:', error.message);
    }
    
    // 6. Data Integrity Check
    console.log('\n=== 6. DATA INTEGRITY CHECK ===');
    try {
        // Check for orphaned records
        const usersWithoutProfiles = await prisma.user.findMany({
            where: {
                role: 'developer',
                developerProfile: null
            }
        });
        
        if (usersWithoutProfiles.length > 0) {
            console.log(`⚠️  Found ${usersWithoutProfiles.length} developers without profiles`);
        } else {
            console.log('✅ All developers have profiles');
        }
        
        // Check for projects without assignments
        const projectsWithoutAssignments = await prisma.project.findMany({
            where: {
                assignments: {
                    none: {}
                }
            }
        });
        
        console.log(`📊 Projects without assignments: ${projectsWithoutAssignments.length}`);
        
    } catch (error) {
        console.error('❌ Data integrity check failed:', error.message);
    }
    
    // 7. Migration Issues Detection
    console.log('\n=== 7. MIGRATION ISSUES DETECTION ===');
    
    // Check for common migration problems
    const migrationIssues = [];
    
    // Issue 1: Environment variable mismatch
    if (!envVars.DATABASE_URL) {
        migrationIssues.push('DATABASE_URL not set (required by Prisma)');
    }
    
    // Issue 2: Database name mismatch
    const dbMatch = envVars.DATABASE_URL?.match(/\/([^?]+)\?/);
    const currentDb = dbMatch ? dbMatch[1] : null;
    
    if (currentDb === 'test' && envVars.NODE_ENV === 'production') {
        migrationIssues.push('Using test database in production environment');
    }
    
    if (currentDb === 'production' && envVars.NODE_ENV === 'development') {
        migrationIssues.push('Using production database in development environment');
    }
    
    if (migrationIssues.length > 0) {
        console.log('🚨 MIGRATION ISSUES DETECTED:');
        migrationIssues.forEach(issue => console.log(`  - ${issue}`));
    } else {
        console.log('✅ No obvious migration issues detected');
    }
    
    // 8. Recommendations
    console.log('\n=== 8. RECOMMENDATIONS ===');
    
    if (migrationIssues.length > 0) {
        console.log('🔧 IMMEDIATE FIXES NEEDED:');
        
        if (!envVars.DATABASE_URL) {
            console.log('1. Set DATABASE_URL environment variable');
        }
        
        if (currentDb === 'test' && envVars.NODE_ENV === 'production') {
            console.log('2. Update DATABASE_URL to point to production database');
        }
        
        if (currentDb === 'production' && envVars.NODE_ENV === 'development') {
            console.log('3. Update DATABASE_URL to point to test/development database');
        }
        
        console.log('4. Run: npx prisma generate');
        console.log('5. Run: npx prisma db push');
        console.log('6. Test authentication flow');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Fix environment variables');
    console.log('2. Regenerate Prisma client');
    console.log('3. Test API endpoints');
    console.log('4. Verify admin dashboard access');
    
    // Cleanup
    if (prisma) {
        await prisma.$disconnect();
    }
    
    console.log('\n✅ Database migration audit complete!');
}

// Run the audit
auditDatabaseMigration().catch(console.error);
