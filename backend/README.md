# Backend (scaffold)

This is a real, runnable Express server — not a placeholder file — but it
currently only exposes a `/health` endpoint. The frontend does not call it.

## Why this exists

So a real dev team has working infrastructure (CORS, security headers,
error handling, env config, Docker, Railway config) to build actual API
routes on top of, instead of starting from zero.

## Run locally

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:8080/health`.

## Next steps for a dev team

1. Add a real authentication route (replace the frontend's hardcoded
   `Demo@2024` check) and issue JWTs signed with `JWT_SECRET`.
2. Add routes matching `supabase/migrations/0001_init.sql` — start with
   `/api/doctors` and `/api/call-reports`, following the example comment
   block in `src/server.js`.
3. Replace the frontend's `useState`-based data in `src/App.jsx` with real
   `fetch` calls to these routes, using `VITE_API_BASE_URL`.
4. Enable Row Level Security in Supabase before any real data goes in
   (see the bottom of the migration file).
