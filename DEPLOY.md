# Vercel Deployment Guide

This guide explains how to deploy the `irongate` app to Vercel from a new GitHub repository.

## 1. Push your project to GitHub

1. Create a new repository on GitHub.
2. In your local repo:

```bash
cd c:\Users\ASUS\Downloads\gym
git init
git remote add origin https://github.com/<your-username>/<your-repo>.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

## 2. Connect the repo on Vercel

1. Go to https://vercel.com/new
2. Choose your GitHub repository.
3. In the project settings, use:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## 3. Add environment variables

If your app uses Supabase or other secrets, add them in the Vercel dashboard under `Settings > Environment Variables`.

Example variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Be sure to also include any other keys used by your app.

## 4. Deploy and test

1. Trigger a deployment by pushing a new commit.
2. Visit the Vercel URL to verify the app loads.
3. Test the signup flow and confirm email page.

## 5. Update and retest

For every change you want to test:

```bash
git add .
git commit -m "Update signup confirmation flow"
git push
```

Vercel will automatically deploy the new build.
