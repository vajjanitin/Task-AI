# Deployment (Vercel + Render)

## Server (Render)
- Blueprint file: `render.yaml` (already included)
- Root directory: `saas/server`
- Start command: `npm start`
- Set environment variables:
  - NODE_ENV=production
  - CORS_ORIGIN=https://YOUR_CLIENT_URL
  - DATABASE_URL
  - CLERK_SECRET_KEY
  - GEMINI_API_KEY
  - CLIPDROP_API_KEY
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET

## Client (Vercel)
- Root directory: `saas/client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - VITE_CLERK_PUBLISHABLE_KEY
  - VITE_BASE_URL=https://YOUR_SERVER.onrender.com

## Clerk settings
- Add the Vercel client URL to Clerk allowed origins.
- Add the Render server URL to Clerk backend API allowed origins (if required by your Clerk settings).
