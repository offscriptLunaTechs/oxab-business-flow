# KECC Business Flow - Deployment Guide 🚀

## Overview
This guide will help you deploy the KECC webapp to **kecc.lunatechs.website** using Cloudflare Pages.

## Prerequisites ✅
- Cloudflare account with lunatechs.website domain
- GitHub repository access
- Supabase project URL and API key

## Step 1: Cloudflare Pages Setup

### 1.1 Access Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your **lunatechs.website** domain
3. In the left sidebar, click **"Pages"**
4. Click **"Create a project"**

### 1.2 Connect Repository
1. Click **"Connect to Git"** → **"GitHub"**
2. Authorize Cloudflare to access your repositories
3. Find and select **"oxab-business-flow"**
4. Click **"Begin setup"**

### 1.3 Configure Build Settings
```
Project name: kecc-business-flow
Production branch: main
Framework preset: None (or Vite if available)
Build command: npm run build
Build output directory: dist
Root directory: / (leave empty)
```

### 1.4 Environment Variables
Click **"Add variable"** and add these exact variables:

```
VITE_SUPABASE_URL = [YOUR_SUPABASE_PROJECT_URL]
VITE_SUPABASE_ANON_KEY = [YOUR_SUPABASE_ANON_KEY]
VITE_APP_NAME = KECC Business Flow
VITE_APP_ENV = production
```

**⚠️ Important:** Replace the bracketed values with your actual Supabase credentials.

### 1.5 Deploy
1. Click **"Save and Deploy"**
2. Wait for the first deployment to complete (2-3 minutes)
3. Note the temporary URL (something like `kecc-business-flow.pages.dev`)

## Step 2: Custom Domain Setup

### 2.1 Add Custom Domain
1. In your Cloudflare Pages project, go to **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter: `kecc.lunatechs.website`
4. Click **"Continue"**

### 2.2 DNS Configuration
Cloudflare will automatically:
- ✅ Create the CNAME record for kecc.lunatechs.website
- ✅ Configure SSL certificate
- ✅ Set up CDN routing

**DNS Record Created:**
```
Type: CNAME
Name: kecc
Target: kecc-business-flow.pages.dev (auto-managed)
```

## Step 3: Verify Deployment

### 3.1 Test the Application
1. Visit `https://kecc.lunatechs.website`
2. Verify the KECC login page loads
3. Test the Supabase connection
4. Check that React Router routes work correctly

### 3.2 Test Features
- ✅ Dashboard loads
- ✅ Invoice creation works
- ✅ Customer management functions
- ✅ PDF generation works
- ✅ All routes accessible via direct URL

## Step 4: Auto-Deployment Setup

### 4.1 Continuous Deployment
Every time you push to the `main` branch:
1. Cloudflare Pages automatically detects the change
2. Builds the application using `npm run build`
3. Deploys to `kecc.lunatechs.website`
4. Updates typically take 2-3 minutes

### 4.2 Test Auto-Deployment
```bash
# Make a small change to test
git add .
git commit -m "Test auto deployment"
git push origin main
```

Watch the deployment in Cloudflare Pages dashboard.

## Step 5: Production Checklist

### 5.1 Security
- ✅ Environment variables are secure (not exposed in frontend)
- ✅ Supabase RLS (Row Level Security) policies enabled
- ✅ HTTPS enforced by Cloudflare
- ✅ Domain properly configured

### 5.2 Performance
- ✅ Assets cached via CDN
- ✅ Code splitting configured in Vite
- ✅ Gzip compression enabled
- ✅ Service worker for offline functionality

### 5.3 Monitoring
- ✅ Cloudflare Analytics enabled
- ✅ Error tracking via browser console
- ✅ Performance monitoring via Cloudflare

## Troubleshooting 🔧

### Build Fails
**Check:** Environment variables are set correctly
**Solution:** Verify VITE_ prefix and no quotes around values

### Routes Don't Work
**Check:** The `_redirects` file in public folder
**Status:** ✅ Already configured correctly

### Supabase Connection Issues
**Check:** Environment variables and Supabase project status
**Common Fix:** Ensure URLs don't have trailing slashes

### Performance Issues
**Check:** Build optimization in vite.config.ts
**Status:** ✅ Already optimized with code splitting

## Environment Variables Reference

```bash
# Production Environment Variables for Cloudflare Pages
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=KECC Business Flow
VITE_APP_ENV=production
```

## Deployment Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy (automatic on git push)
git push origin main
```

## Success Criteria ✅

Your deployment is successful when:
- ✅ `https://kecc.lunatechs.website` loads the KECC dashboard
- ✅ All navigation routes work correctly
- ✅ Supabase authentication functions
- ✅ Invoice creation and PDF generation work
- ✅ Auto-deployment triggers on git push

## Support

For issues:
1. Check Cloudflare Pages build logs
2. Verify environment variables
3. Test locally with `npm run build && npm run preview`
4. Check browser console for errors

**🎉 Your KECC Business Flow application is now live at https://kecc.lunatechs.website!**