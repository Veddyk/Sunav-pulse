# SunaV Pulse

Enterprise pharmaceutical field force management platform — a single-page
React application covering doctor management, call reporting with GPS
verification, route planning with two-stage approval, expense and leave
management, KPI dashboards, territory analytics, and admin tooling
(user management, audit logs, system configuration).

> **Honest status:** the frontend is complete and fully interactive. There
> is no backend or database connected yet — see [DEPLOYMENT.md](./DEPLOYMENT.md)
> for exactly what's real today versus what's scaffolded for later.

## Tech stack

- **Frontend:** React 18 + Vite, [recharts](https://recharts.org) for
  charts, [lucide-react](https://lucide.dev) for icons, Leaflet (loaded via
  CDN) for the GPS check-in and territory maps.
- **Backend (scaffold):** Express on Node.js.
- **Database (scaffold):** PostgreSQL, designed for Supabase.

## Quickstart (frontend only)

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Sign in with any of the demo accounts shown
on the login screen (password for all of them: `Demo@2024`).

## Project structure

```
sunav-pulse/
├── src/
│   ├── App.jsx          # the entire application
│   ├── main.jsx          # React entry point
│   └── index.css
├── backend/               # minimal Express API scaffold (not yet wired up)
├── supabase/migrations/   # Postgres schema matching the app's data model
├── Dockerfile             # frontend production build (nginx)
├── docker-compose.yml     # local dev: frontend + backend + Postgres
├── vercel.json            # Vercel deployment config
├── railway.json           # Railway deployment config (backend)
└── DEPLOYMENT.md          # full step-by-step deployment guide
```

## Deploying

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full walkthrough — written for
non-developers, covers Vercel (frontend), Railway (backend), Supabase
(database), custom domains/SSL, and rollback steps.

## License

Internal/demo use. Add a real license before any external distribution.
