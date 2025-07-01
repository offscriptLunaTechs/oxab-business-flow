# KECC Cloudflare Pages Deployment Guide

This project is configured for automatic deployment to Cloudflare Pages.

## Build Configuration for Cloudflare Pages

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Node.js Version**: 18 or 20

## Required Environment Variables

Set these in your Cloudflare Pages project settings:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## SPA Routing Support

The `public/_redirects` file ensures React Router works correctly on Cloudflare Pages.

## Deployment Process

1. Connect your GitHub repository to Cloudflare Pages
2. Configure the build settings as shown above
3. Add your environment variables
4. Set up your custom domain
5. Every push to `main` branch auto-deploys

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (test before deployment)
npm run build

# Preview production build
npm run preview
```

## Environment Variables for Development

Copy `.env.example` to `.env.local` and fill in your Supabase credentials.