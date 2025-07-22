const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testAuthentication() {
    console.log('🔐 Authentication System Test\n');
    
    const prisma = new PrismaClient();
    
    try {
        // Test 1: Check if admin user exists
        console.log('=== 1. ADMIN USER CHECK ===');
        const adminUser = await prisma.user.findUnique({
            where: { email: 'dennis@andishi.dev' }
        });
        
        if (adminUser) {
            console.log('✅ Admin user found:');
            console.log(`  - Email: ${adminUser.email}`);
            console.log(`  - Role: ${adminUser.role}`);
            console.log(`  - Status: ${adminUser.status}`);
            console.log(`  - Active: ${adminUser.isActive}`);
            console.log(`  - Account Created: ${adminUser.accountCreated}`);
            console.log(`  - Has Password: ${!!adminUser.password}`);
            console.log(`  - Login Attempts: ${adminUser.loginAttempts}`);
            console.log(`  - Account Locked: ${adminUser.accountLocked}`);
        } else {
            console.log('❌ Admin user not found');
        }
        
        // Test 2: Check password validation
        console.log('\n=== 2. PASSWORD VALIDATION TEST ===');
        if (adminUser && adminUser.password) {
            // Test with a common password (you'll need to replace with actual)
            const testPasswords = ['password', 'admin', '123456', 'andishi123'];
            
            for (const testPassword of testPasswords) {
                try {
                    const isValid = await bcrypt.compare(testPassword, adminUser.password);
                    if (isValid) {
                        console.log(`✅ Password "${testPassword}" is valid`);
                        break;
                    }
                } catch (error) {
                    console.log(`❌ Error testing password "${testPassword}":`, error.message);
                }
            }
        } else {
            console.log('❌ No password set for admin user');
        }
        
        // Test 3: Check JWT secret
        console.log('\n=== 3. JWT CONFIGURATION ===');
        const jwtSecret = process.env.JWT_SECRET;
        const nextAuthSecret = process.env.NEXTAUTH_SECRET;
        
        console.log('JWT_SECRET:', jwtSecret ? 'SET' : 'NOT SET');
        console.log('NEXTAUTH_SECRET:', nextAuthSecret ? 'SET' : 'NOT SET');
        
        if (!jwtSecret && !nextAuthSecret) {
            console.log('❌ No JWT secrets configured - authentication will fail');
        }
        
        // Test 4: Check all users
        console.log('\n=== 4. ALL USERS OVERVIEW ===');
        const allUsers = await prisma.user.findMany({
            select: {
                email: true,
                role: true,
                status: true,
                isActive: true,
                accountLocked: true,
                loginAttempts: true
            }
        });
        
        console.log(`Total users: ${allUsers.length}`);
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.status} - ${user.isActive ? 'Active' : 'Inactive'}`);
        });
        
        // Test 5: Check for common issues
        console.log('\n=== 5. COMMON ISSUES CHECK ===');
        
        const issues = [];
        
        // Check for locked accounts
        const lockedUsers = allUsers.filter(u => u.accountLocked);
        if (lockedUsers.length > 0) {
            issues.push(`${lockedUsers.length} accounts are locked`);
        }
        
        // Check for inactive accounts
        const inactiveUsers = allUsers.filter(u => !u.isActive);
        if (inactiveUsers.length > 0) {
            issues.push(`${inactiveUsers.length} accounts are inactive`);
        }
        
        // Check for pending accounts
        const pendingUsers = allUsers.filter(u => u.status === 'pending');
        if (pendingUsers.length > 0) {
            issues.push(`${pendingUsers.length} accounts are pending approval`);
        }
        
        if (issues.length > 0) {
            console.log('⚠️  Issues found:');
            issues.forEach(issue => console.log(`  - ${issue}`));
        } else {
            console.log('✅ No obvious account issues found');
        }
        
    } catch (error) {
        console.error('❌ Authentication test failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testAuthentication().catch(console.error);
