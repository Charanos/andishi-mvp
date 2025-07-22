const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
    console.log('🔍 Simple Database Connection Test\n');
    
    // Check environment variables
    console.log('Environment Variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
    
    if (process.env.DATABASE_URL) {
        const dbMatch = process.env.DATABASE_URL.match(/\/([^?]+)\?/);
        const dbName = dbMatch ? dbMatch[1] : 'unknown';
        console.log('Database Name:', dbName);
    }
    
    console.log('\n--- Testing Prisma Connection ---');
    
    const prisma = new PrismaClient({
        log: ['error', 'warn'],
    });
    
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('✅ Connected successfully!');
        
        console.log('Testing basic query...');
        const userCount = await prisma.user.count();
        console.log(`✅ Found ${userCount} users`);
        
        // Test a simple user lookup
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
            console.log(`✅ Sample user: ${firstUser.email} (${firstUser.role})`);
        } else {
            console.log('⚠️  No users found in database');
        }
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        
        if (error.message.includes('authentication')) {
            console.log('\n💡 Authentication issue - check username/password in DATABASE_URL');
        } else if (error.message.includes('timeout')) {
            console.log('\n💡 Connection timeout - check network/firewall');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('\n💡 DNS resolution failed - check MongoDB cluster URL');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase().catch(console.error);
