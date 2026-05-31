# Vercel Deployment Guide

This guide explains how to deploy the `irongate` app to Vercel.

## Prerequisites

- GitHub account with the repo pushed to `main` branch
- Supabase project with email confirmations enabled
- Vercel account

## 1. Create a Vercel project

1. Go to https://vercel.com/new
2. Select your `TopsyCreet/gym` repository (or your fork)
3. Choose the `main` branch
4. Framework: **Vite** (should auto-detect)

## 2. Configure build settings

Vercel should auto-detect these, but confirm:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Root Directory** | `./` |

## 3. Add environment variables

In the Vercel project settings, go to **Environment Variables** and add:

```
VITE_SUPABASE_URL=https://kswftzonddsthleqwghb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NNOobWdfYHDhAxLbOQQqBQ_t9RhV0xa
```

**For Production and Preview environments**.

> ⚠️ These are your Supabase public/anon keys—they are safe to share as they're read-only. Keep your Supabase service role key (admin key) secret.

## 4. Configure Supabase (one-time setup)

1. Go to your Supabase project dashboard.
2. Under **Authentication > Providers > Email**:
   - Enable **Confirm email**
   - Set **Site URL** to your Vercel deployment URL (or custom domain).
   - Example: `https://gym-abc123.vercel.app`

3. Under **Email Templates** (if needed):
   - Verify the default confirmation email looks good.
   - Or customize the "Confirm signup" template.

## 5. Deploy

1. Click **Deploy** in Vercel.
2. Wait for the build to complete (watch the build logs).
3. Once deployed, visit your Vercel URL.

## 6. Test the signup flow

1. Open the deployed app.
2. Click **Sign Up**.
3. Fill in the form and complete onboarding.
4. You should see the **Confirm Email** page.
5. Check your email (or spam folder) for the confirmation link.
6. Click the confirmation link—it should activate your account.
7. Return to the app and log in.

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs in Vercel > Deployments. Verify TypeScript compiles locally: `npm run build` |
| Env vars not loading | Confirm they're added to **Production** environment in Vercel settings. Redeploy if needed. |
| Email not arriving | Check Supabase logs. Verify **Site URL** is set. Try spam folder. |
| Confirmation link doesn't work | Ensure Supabase Site URL matches your Vercel domain. Re-deploy to Supabase config if changed. |

## 8. Update and redeploy

Push changes to `main` and Vercel auto-deploys:

```bash
git add .
git commit -m "Fix signup flow"
git push origin main
```

Check the Vercel dashboard for deployment status.
