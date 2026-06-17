# Manoj Bisht — Portfolio (npm version)

Full-stack personal portfolio with admin CMS. Built with React + Vite (frontend) and Express + Drizzle ORM (backend).

## Quick Start (Local VS Code)

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/) (download and install)
- A free PostgreSQL database (see options below)

### 2. Get a Free Database

**Option A — Neon (recommended, 100% free):**
1. Go to [neon.tech](https://neon.tech) → Sign up free
2. Create a new project
3. Copy your connection string (looks like `postgresql://user:pass@host/dbname`)

**Option B — Supabase:**
1. Go to [supabase.com](https://supabase.com) → Sign up free
2. Create a new project → Settings → Database → Connection string

### 3. Setup

```bash
# 1. Clone / download this project, then:
cd npm-version

# 2. Create your .env file
cp .env.example .env
# Open .env and set your DATABASE_URL

# 3. Install all dependencies
npm install

# 4. Push the database schema (creates all tables)
npm run db:push

# 5. Seed the admin user
npm run db:seed
```

### 4. Run Locally

```bash
npm run dev
```

This starts both servers:
- **Frontend** → http://localhost:5173
- **API** → http://localhost:3001

Open http://localhost:5173 in your browser!

### 5. Admin Panel

- URL: http://localhost:5173/admin
- Email: `admin@manoj.dev`
- Password: `admin123`

**Change your password** after first login via Admin → Password.

---

## Free Deployment Options

### Option 1: Railway (easiest — full stack in one place)
1. Go to [railway.app](https://railway.app) → Sign up free
2. New Project → Deploy from GitHub repo
3. Add a PostgreSQL database (free tier)
4. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
5. Deploy!

### Option 2: Render (free tier)
**Backend:**
1. [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Root directory: `server`, Build: `npm install`, Start: `npm start`
4. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `PORT=3001`, `NODE_ENV=production`

**Frontend:**
1. New Static Site on Render
2. Root directory: `client`, Build: `npm install && npm run build`, Publish: `dist`
3. Add env var: none needed (uses relative `/api` paths)

### Option 3: Vercel (frontend) + Railway (backend)
- Deploy `client/` to Vercel (free)
- Deploy `server/` to Railway (free tier)
- Update Vite proxy in production to point to your Railway URL

---

## Project Structure

```
npm-version/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/hooks.ts      # All API calls (replaces generated code)
│   │   ├── components/       # UI components
│   │   ├── lib/              # theme, utils
│   │   ├── pages/            # All pages
│   │   └── App.tsx
│   └── vite.config.ts        # Dev server + API proxy
├── server/                    # Express API
│   ├── src/
│   │   ├── db/               # Drizzle schema + connection
│   │   ├── lib/auth.ts       # JWT auth
│   │   ├── routes/           # All API routes
│   │   └── index.ts          # Server entry
│   └── drizzle.config.ts
├── .env.example               # Copy to .env
└── package.json               # Root scripts
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `JWT_SECRET` | Secret for JWT tokens — change in production! |
| `PORT` | Server port (default: 3001) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) |

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Express 5, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (any provider)
- **Auth**: JWT in httpOnly cookies

## Changing Content

All portfolio content is stored in the database and editable from the admin panel at `/admin`.

No hardcoded content — just update it in the CMS!
