# cPanel MongoDB Atlas Connection Troubleshooting Guide

## Problem Summary
Your Node.js application works locally and on Vercel but fails to connect to MongoDB Atlas when deployed on cPanel shared hosting.

## Root Cause
**cPanel shared hosting providers typically block outbound connections to MongoDB Atlas due to firewall restrictions.**

## Immediate Solutions

### 1. Contact Your Hosting Provider (PRIORITY 1)
Contact your cPanel hosting provider's support and request:

```
Subject: Request to Enable MongoDB Atlas Connectivity

Hello,

I need to connect my Node.js application to MongoDB Atlas. Please enable the following:

1. Whitelist outbound connections to *.mongodb.net domains
2. Open outbound port 27017 for MongoDB connections
3. Allow connections to these MongoDB Atlas IP ranges:
   - AWS: 3.0.0.0/8, 52.0.0.0/8, 54.0.0.0/8
   - GCP: 35.184.0.0/13, 35.192.0.0/14
   - Azure: 20.0.0.0/8, 40.0.0.0/8

My application works on other platforms but fails on your servers due to firewall restrictions.

Thank you.
```

### 2. Alternative Connection Methods

#### Option A: Use Direct IP Connection
If SRV records don't work, get direct IPs:

```bash
# Find your cluster's actual IP addresses
nslookup your-cluster.mongodb.net
dig your-cluster.mongodb.net
```

Then update your connection string:
```javascript
// Instead of: mongodb+srv://user:pass@cluster.mongodb.net/db
// Use: mongodb://user:pass@ip1:27017,ip2:27017,ip3:27017/db?replicaSet=atlas-xxx
```

#### Option B: Use Alternative Ports
Some providers allow connections on non-standard ports. Try:
- Port 443 (HTTPS)
- Port 80 (HTTP)
- Custom ports if available

### 3. Database Alternatives

If MongoDB Atlas remains blocked:

#### Option A: Local MongoDB
Ask your hosting provider if they support MongoDB installation on your account.

#### Option B: Switch to MySQL/PostgreSQL
Most cPanel hosts support these databases natively:

```javascript
// Example MySQL connection
const mysql = require('mysql2/promise');
const connection = await mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
```

#### Option C: Use a Different Hosting Provider
Consider hosts that explicitly support MongoDB Atlas:
- DigitalOcean App Platform
- Railway
- Render
- Heroku
- AWS Elastic Beanstalk

### 4. Upgrade Hosting Plan
Consider upgrading to:
- VPS hosting (full control over firewall)
- Dedicated server
- Cloud hosting platforms

## Diagnostic Steps

### Step 1: Run Connection Test
Upload and run the diagnostic script:
```bash
node db-connection-test.js
```

### Step 2: Check Server Logs
Look for these error patterns in your cPanel error logs:
- `ECONNREFUSED` - Port blocked
- `ENOTFOUND` - DNS resolution failed
- `timeout` - Firewall blocking connection
- `authentication failed` - Credentials issue

### Step 3: Test Network Connectivity
From your cPanel terminal (if available):
```bash
# Test if you can reach MongoDB Atlas
telnet your-cluster.mongodb.net 27017
# or
nc -zv your-cluster.mongodb.net 27017
```

## Environment Variables Checklist

Ensure these are set in your cPanel Node.js app:
```
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
NODE_ENV=production
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com
```

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Port 27017 blocked | Contact hosting provider |
| `ENOTFOUND` | DNS resolution failed | Use direct IP addresses |
| `timeout` | Firewall blocking | Request firewall whitelist |
| `authentication failed` | Wrong credentials | Check username/password |
| `server selection timeout` | Can't reach any servers | Network/firewall issue |

## Prevention for Future Deployments

1. **Always check hosting provider's database support** before purchasing
2. **Ask specifically about MongoDB Atlas connectivity** during sales
3. **Test database connections** before going live
4. **Have backup database solutions** ready

## If All Else Fails

### Quick Migration Options:
1. **Export your MongoDB data** using `mongodump`
2. **Convert to MySQL/PostgreSQL** using migration tools
3. **Use a database-agnostic ORM** like Prisma for easier switching
4. **Move to a MongoDB-friendly hosting provider**

## Support Contacts

When contacting support, provide:
- Your connection string (with credentials hidden)
- Error messages from logs
- Confirmation that it works on other platforms
- This troubleshooting guide as reference

---

**Remember**: This is a common issue with shared hosting. Don't let hosting providers dismiss it as "broken files" - it's a network/firewall configuration issue that they need to resolve.
