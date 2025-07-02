# GitHub Actions Workflows

This directory contains automated deployment workflows for the KECC Business Flow application.

## Available Workflows

- `deploy.yml` - Automated deployment to Cloudflare Workers
  - Deploys to preview environment on pull requests
  - Deploys to production on main branch pushes
  - Requires GitHub secrets configuration

## Required GitHub Secrets

Add these secrets in your repository settings:

- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Setup Instructions

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the required secrets listed above
3. Push to main branch or create a pull request to trigger deployment
