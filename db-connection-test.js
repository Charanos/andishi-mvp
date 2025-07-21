const { MongoClient } = require('mongodb');
const dns = require('dns');
const net = require('net');

// Test script to diagnose MongoDB connection issues on cPanel
async function testDatabaseConnection() {
    console.log('=== MongoDB Connection Diagnostic Test ===\n');
    
    // Get connection details from environment
    const connectionString = process.env.DATABASE_URI || process.env.MONGODB_URI;
    
    if (!connectionString) {
        console.error('❌ No DATABASE_URI or MONGODB_URI found in environment variables');
        return;
    }
    
    console.log('✅ Connection string found in environment');
    console.log('🔗 Connection string:', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    // Test 1: DNS Resolution
    console.log('\n--- Test 1: DNS Resolution ---');
    try {
        const url = new URL(connectionString);
        const hostname = url.hostname;
        console.log('🔍 Testing DNS resolution for:', hostname);
        
        if (hostname.includes('mongodb.net')) {
            // Test SRV record resolution
            dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
                if (err) {
                    console.error('❌ SRV record resolution failed:', err.message);
                    console.log('💡 Suggestion: Your hosting provider may not support SRV records');
                } else {
                    console.log('✅ SRV records resolved:', addresses);
                }
            });
            
            // Test A record resolution
            dns.resolve4(hostname, (err, addresses) => {
                if (err) {
                    console.error('❌ A record resolution failed:', err.message);
                } else {
                    console.log('✅ A records resolved:', addresses);
                }
            });
        }
    } catch (error) {
        console.error('❌ Invalid connection string format:', error.message);
    }
    
    // Test 2: Port Connectivity
    console.log('\n--- Test 2: Port Connectivity ---');
    try {
        const url = new URL(connectionString);
        const hostname = url.hostname;
        const port = url.port || 27017;
        
        console.log(`🔍 Testing connection to ${hostname}:${port}`);
        
        const socket = new net.Socket();
        const timeout = 10000; // 10 seconds
        
        socket.setTimeout(timeout);
        
        socket.on('connect', () => {
            console.log(`✅ Port ${port} is accessible`);
            socket.destroy();
        });
        
        socket.on('timeout', () => {
            console.error(`❌ Connection timeout - Port ${port} may be blocked by firewall`);
            socket.destroy();
        });
        
        socket.on('error', (error) => {
            console.error(`❌ Connection failed:`, error.message);
            if (error.code === 'ECONNREFUSED') {
                console.log('💡 Suggestion: Port may be blocked by hosting provider firewall');
            }
        });
        
        socket.connect(port, hostname);
        
    } catch (error) {
        console.error('❌ Port test failed:', error.message);
    }
    
    // Test 3: MongoDB Connection
    console.log('\n--- Test 3: MongoDB Connection ---');
    try {
        console.log('🔍 Attempting MongoDB connection...');
        
        const client = new MongoClient(connectionString, {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            connectTimeoutMS: 10000,
        });
        
        await client.connect();
        console.log('✅ MongoDB connection successful!');
        
        // Test database operation
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log(`✅ Database accessible, found ${collections.length} collections`);
        
        await client.close();
        console.log('✅ Connection closed successfully');
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        // Provide specific suggestions based on error type
        if (error.message.includes('ENOTFOUND')) {
            console.log('💡 Suggestion: DNS resolution failed - check if SRV records are supported');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Suggestion: Connection refused - port 27017 may be blocked');
        } else if (error.message.includes('timeout')) {
            console.log('💡 Suggestion: Connection timeout - firewall may be blocking outbound connections');
        } else if (error.message.includes('authentication')) {
            console.log('💡 Suggestion: Check your username/password and database permissions');
        }
    }
    
    // Test 4: Environment Variables
    console.log('\n--- Test 4: Environment Variables ---');
    const envVars = [
        'DATABASE_URI',
        'MONGODB_URI', 
        'NODE_ENV',
        'JWT_SECRET',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL'
    ];
    
    envVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            if (varName.includes('SECRET') || varName.includes('URI')) {
                console.log(`✅ ${varName}: ***hidden***`);
            } else {
                console.log(`✅ ${varName}: ${value}`);
            }
        } else {
            console.log(`❌ ${varName}: Not set`);
        }
    });
    
    console.log('\n=== Diagnostic Test Complete ===');
    console.log('\n📋 Next Steps:');
    console.log('1. Contact your hosting provider about MongoDB Atlas connectivity');
    console.log('2. Ask them to whitelist MongoDB Atlas IP ranges');
    console.log('3. Request opening of outbound port 27017');
    console.log('4. Consider alternative database solutions if restrictions persist');
}

// Run the test
testDatabaseConnection().catch(console.error);
