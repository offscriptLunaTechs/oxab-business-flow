# 🚀 KECC Deployment - Quick Setup Checklist

## Before You Start
- [ ] Cloudflare account with `lunatechs.website` domain added
- [ ] Supabase project URL and anon key ready
- [ ] GitHub repository access confirmed

## Environment Variables You Need
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Quick Steps (5 minutes)

### Step 1: Cloudflare Pages
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages
2. Create new project → Connect GitHub → Select `oxab-business-flow`
3. **Build settings:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variables above

### Step 2: Custom Domain
1. In Pages project → Custom domains
2. Add: `kecc.lunatechs.website`
3. Cloudflare auto-configures DNS

### Step 3: Test
- Visit `https://kecc.lunatechs.website`
- Test login with Supabase
- Create a test invoice

## ✅ Success Indicators
- [ ] Site loads at kecc.lunatechs.website
- [ ] KECC dashboard appears
- [ ] Supabase connection works
- [ ] All routes accessible
- [ ] Invoice creation functions
- [ ] PDF generation works

## 🔧 If Something Goes Wrong
- **Build fails:** Check environment variables have `VITE_` prefix
- **Routes broken:** `_redirects` file should handle this (already configured)
- **Supabase errors:** Verify URL doesn't have trailing slash

## 📖 Need More Help?
See the complete `DEPLOYMENT.md` guide for detailed instructions.

---
**Next deployment:** Just push to main branch, Cloudflare auto-deploys! 🎉