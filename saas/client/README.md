# Client (Vite + React)

## Environment variables
Create these in Vercel for the client project:

- VITE_CLERK_PUBLISHABLE_KEY
- VITE_BASE_URL (Render server URL, e.g. https://YOUR_SERVER.onrender.com)

## Deploy to Vercel
1. Import the repo into Vercel.
2. Set Root Directory to `saas/client`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add the env vars above.

## Local dev
- Install deps: `npm install`
- Run: `npm run dev`
