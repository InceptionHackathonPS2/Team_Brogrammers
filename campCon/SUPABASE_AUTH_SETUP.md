# Supabase Authentication Setup for Vercel

This guide explains how to configure Supabase authentication to work correctly with your Vercel deployment.

## Problem

When users sign up, Supabase sends an email confirmation link. If not configured correctly, this link may point to `localhost` instead of your production URL.

## Solution

### Step 1: Configure Redirect URLs in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. In the **Redirect URLs** section, add your URLs:

   **Site URL** (Primary):
   ```
   https://your-vercel-app.vercel.app
   ```

   **Redirect URLs** (Additional URLs allowed):
   ```
   https://your-vercel-app.vercel.app/auth/callback
   http://localhost:5173/auth/callback
   http://localhost:5173
   ```

   **Note**: Replace `your-vercel-app.vercel.app` with your actual Vercel deployment URL.

4. Click **Save**

### Step 2: Add Environment Variable (Optional but Recommended)

For better control, you can set a `VITE_SITE_URL` environment variable:

1. In Vercel, go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - **Name**: `VITE_SITE_URL`
   - **Value**: `https://your-vercel-app.vercel.app`
   - **Environment**: Production (and Preview if needed)

### Step 3: Verify Configuration

1. The code automatically detects the correct redirect URL:
   - In production: Uses `window.location.origin` (your Vercel URL)
   - Falls back to `VITE_SITE_URL` if set
   - Development: Uses `http://localhost:5173`

2. Test the signup flow:
   - Sign up with a new email
   - Check your email for the confirmation link
   - The link should point to your Vercel URL, not localhost

## Multiple Environments

If you have multiple environments (production, preview, development):

### Production
```
Site URL: https://your-app.vercel.app
Redirect URLs:
  - https://your-app.vercel.app/auth/callback
```

### Preview Deployments
Vercel creates preview URLs for each branch/PR. You can either:

**Option 1**: Use wildcard (if supported by Supabase)
```
Redirect URLs:
  - https://*.vercel.app/auth/callback
```

**Option 2**: Add specific preview URLs as needed
```
Redirect URLs:
  - https://your-app-git-main.vercel.app/auth/callback
  - https://your-app-git-feature.vercel.app/auth/callback
```

### Development
```
Redirect URLs:
  - http://localhost:5173/auth/callback
  - http://localhost:5173
```

## How It Works

The application uses a helper function `getRedirectUrl()` that:

1. **In the browser** (production/preview):
   - Uses `window.location.origin` to get the current domain
   - Appends `/auth/callback` to create the redirect URL
   - This ensures it always uses the correct domain

2. **Fallback**:
   - If `VITE_SITE_URL` is set, uses that
   - Otherwise defaults to `http://localhost:5173/auth/callback`

## Email Templates

You can customize the email templates in Supabase:

1. Go to **Authentication** → **Email Templates**
2. Customize the **Confirm signup** template
3. The `{{ .ConfirmationURL }}` variable will use the redirect URL configured above

## Troubleshooting

### Links Still Point to Localhost

1. **Check Supabase Settings**:
   - Verify Site URL is set to your Vercel URL
   - Verify Redirect URLs include your Vercel URL

2. **Clear Browser Cache**:
   - Sometimes old redirect URLs are cached

3. **Check Environment Variables**:
   - Ensure `VITE_SITE_URL` is set correctly in Vercel
   - Redeploy after adding environment variables

### 404 on /auth/callback

The `/auth/callback` route is handled by Supabase's auth flow. Make sure:
- The route exists in your app (it should work automatically)
- The redirect URL in Supabase matches exactly

### Email Not Sending

1. Check Supabase **Authentication** → **Providers** → **Email**
2. Ensure email provider is enabled
3. Check rate limits
4. Verify email templates are configured

## Security Notes

- Never commit `.env` files with real credentials
- Use environment variables in Vercel for all sensitive data
- Regularly rotate your Supabase keys
- Use RLS (Row Level Security) policies in Supabase for data protection

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase URL Configuration](https://supabase.com/docs/guides/auth/url-configuration)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

