# Complete Guide: Migrating from cPanel to Vercel

## Why Vercel is Perfect for Your App

✅ **Native Next.js Support** - Vercel is built by the Next.js team  
✅ **MongoDB Atlas Works** - No firewall restrictions  
✅ **Automatic Deployments** - Git-based deployments  
✅ **Edge Functions** - Better performance globally  
✅ **Free Tier** - Generous limits for most projects  
✅ **Custom Domains** - Easy domain management  

## Step-by-Step Migration Process

### Phase 1: Prepare Your Project

#### 1. Verify Your Project Structure
Your project is already Vercel-ready! ✅
- Next.js 15.3.3 ✅
- MongoDB/Mongoose setup ✅
- Environment variables ready ✅

#### 2. Update Build Configuration (if needed)
Create/update `vercel.json` for optimal deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Phase 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub, GitLab, or Bitbucket
3. **Import Project**:
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect Next.js settings

4. **Configure Environment Variables**:
   ```
   DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   JWT_SECRET=your-jwt-secret
   NODE_ENV=production
   ```

5. **Deploy**: Click "Deploy" - takes 2-3 minutes

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
cd e:\Charanos\Documents\Dev\andishi-mvp
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: andishi-mvp
# - Directory: ./
# - Override settings? N
```

### Phase 3: Configure Custom Domain

#### 1. Add Your Domain to Vercel
- Go to Project Settings → Domains
- Add your custom domain (e.g., `yourdomain.com`)
- Vercel provides DNS instructions

#### 2. Update DNS Records
Point your domain to Vercel:
```
Type: CNAME
Name: @ (or www)
Value: cname.vercel-dns.com
```

#### 3. Update Environment Variables
Update `NEXTAUTH_URL` to your custom domain:
```
NEXTAUTH_URL=https://yourdomain.com
```

### Phase 4: Database & Authentication Setup

#### 1. MongoDB Atlas (Already Working)
Your MongoDB Atlas connection will work immediately on Vercel - no firewall issues!

#### 2. Update NextAuth Configuration
Ensure your NextAuth callbacks handle the new domain:

```javascript
// In your NextAuth config
callbacks: {
  async redirect({ url, baseUrl }) {
    // Handle redirects for your new domain
    if (url.startsWith("/")) return `${baseUrl}${url}`
    else if (new URL(url).origin === baseUrl) return url
    return baseUrl
  }
}
```

### Phase 5: Testing & Optimization

#### 1. Test All Functionality
- [ ] User authentication/login
- [ ] Database operations
- [ ] API endpoints
- [ ] File uploads (if any)
- [ ] Email functionality
- [ ] Payment processing (if any)

#### 2. Performance Optimization
```javascript
// next.config.ts - optimize for Vercel
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    domains: ['your-domain.com'],
  },
  // Enable compression
  compress: true,
  // Optimize builds
  swcMinify: true,
}
```

### Phase 6: Go Live

#### 1. Final Environment Check
Verify all environment variables are set in Vercel dashboard.

#### 2. Update External Services
Update webhook URLs and API endpoints in:
- Payment processors (Stripe, PayPal)
- Email services
- Third-party integrations
- OAuth applications

#### 3. DNS Cutover
- Update your domain's DNS to point to Vercel
- Wait for DNS propagation (up to 48 hours)

## Migration Checklist

### Pre-Migration
- [ ] Backup current cPanel files
- [ ] Export database (if using local DB)
- [ ] Document current environment variables
- [ ] Test app locally

### During Migration
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Test database connectivity
- [ ] Set up custom domain
- [ ] Update DNS records

### Post-Migration
- [ ] Test all app functionality
- [ ] Update external service URLs
- [ ] Monitor for 24-48 hours
- [ ] Cancel cPanel hosting (after confirming everything works)

## Troubleshooting Common Issues

### Issue: Build Failures
```bash
# Check build logs in Vercel dashboard
# Common fixes:
npm run build  # Test locally first
```

### Issue: Environment Variables Not Working
- Ensure variables are set in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

### Issue: Database Connection Fails
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Test connection locally first

### Issue: Custom Domain Not Working
- Verify DNS records are correct
- Wait for DNS propagation (up to 48 hours)
- Check domain configuration in Vercel

## Cost Comparison

### cPanel Hosting
- Monthly fee: $5-20/month
- Limited resources
- MongoDB Atlas issues
- Manual deployments

### Vercel
- **Free tier**: 100GB bandwidth, 6,000 build minutes
- **Pro tier**: $20/month (if needed)
- Unlimited deployments
- Global CDN included
- No MongoDB restrictions

## Next Steps After Migration

1. **Set up monitoring** with Vercel Analytics
2. **Enable Speed Insights** for performance tracking
3. **Configure branch deployments** for staging
4. **Set up automatic deployments** from Git
5. **Optimize images** with Vercel Image Optimization

---

## Quick Start Commands

```bash
# If you haven't already, push to Git
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main

# Deploy to Vercel
npx vercel

# Or install CLI globally
npm i -g vercel
vercel login
vercel
```

Your app is already Vercel-ready! The migration should be smooth and solve your MongoDB connectivity issues immediately.
