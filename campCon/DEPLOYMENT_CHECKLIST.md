# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All TypeScript errors are resolved (`npm run build` succeeds locally)
- [ ] All linting errors are fixed (`npm run lint`)
- [ ] Code is committed and pushed to your Git repository
- [ ] No console errors in browser dev tools

### ✅ Environment Variables
- [ ] You have your Supabase project URL
- [ ] You have your Supabase anon key
- [ ] Both values are ready to add to Vercel

### ✅ Database Setup
- [ ] Database schema is created in Supabase (run `database_schema.sql`)
- [ ] All required tables exist
- [ ] Storage buckets are set up (if using image uploads)
- [ ] Test data is added (optional, for testing)

### ✅ Supabase Configuration
- [ ] Authentication is enabled in Supabase
- [ ] Email provider is configured (or use magic links)
- [ ] CORS is configured (or allow all origins for development)
- [ ] RLS policies are set (if using RLS)

## Deployment Steps

### 1. Vercel Setup
- [ ] Create/Login to Vercel account
- [ ] Import your Git repository
- [ ] Framework preset is set to "Vite" (auto-detected)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

### 2. Environment Variables
Add these in Vercel project settings:
- [ ] `VITE_SUPABASE_URL` = Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

### 3. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check build logs for any errors

### 4. Post-Deployment
- [ ] Visit the deployment URL
- [ ] Test user signup/login
- [ ] Test creating a project
- [ ] Test creating an event
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Verify images load correctly (if applicable)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation succeeds locally

### Runtime Errors
- Check browser console for errors
- Verify environment variables are set correctly
- Check Supabase project is active
- Verify database schema is set up

### 404 on Routes
- Verify `vercel.json` includes rewrites
- Check that all routes are client-side routes

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Redeploy after adding/updating variables
- Check variable names match exactly (case-sensitive)

## Quick Commands

```bash
# Test build locally
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint
```

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)

