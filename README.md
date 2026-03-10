# CDP CRM

Sales CRM for managing accounts, contacts, and outreach with AI agent integration.

## Tech Stack

- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Backend**: Python FastAPI (SQLAlchemy, Alembic, Pydantic)
- **Database**: PostgreSQL 16

## Quick Start

### 1. Start with Docker Compose

```bash
cp .env.example .env
docker compose up -d
```

This starts PostgreSQL (:5432), the backend API (:8000), and the frontend (:3000).

### 2. Run Migrations

```bash
docker compose exec backend alembic upgrade head
```

### 3. Seed Data

```bash
docker compose exec backend python scripts/seed.py
```

This creates:
- Admin user: `admin@cdpcrm.com` / `admin123`
- Sales rep: `rep@cdpcrm.com` / `rep123`
- An API key for the AI agent (printed once, save it)

### 4. Open the App

- Frontend: http://localhost:3000
- API Docs (Swagger): http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

## Local Development (without Docker)

### Backend

```bash
cd backend
pip install -e .
# Set DATABASE_URL in .env or environment
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
# Set NEXT_PUBLIC_API_URL in .env.local
npm run dev
```

## Deploy to Railway

This project deploys as 3 Railway services: **PostgreSQL**, **Backend**, and **Frontend**.

### 1. Create a new Railway project

Go to [railway.app](https://railway.app) and create a new project from this repo.

### 2. Add PostgreSQL

Click **"+ New"** > **"Database"** > **"PostgreSQL"**. Railway will provision a Postgres instance and set `DATABASE_URL` automatically.

### 3. Add the Backend service

Click **"+ New"** > **"GitHub Repo"** > select this repo. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Builder** | Dockerfile |

Add these environment variables:
- `DATABASE_URL` → reference the Postgres service's `DATABASE_URL`
- `JWT_SECRET_KEY` → generate a random secret (e.g., `openssl rand -hex 32`)
- `CORS_ORIGINS` → your frontend Railway URL (e.g., `https://your-frontend.up.railway.app`)

The backend auto-runs migrations and seeds on startup.

### 4. Add the Frontend service

Click **"+ New"** > **"GitHub Repo"** > select this repo. Configure:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Builder** | Dockerfile |

Add this environment variable:
- `NEXT_PUBLIC_API_URL` → your backend Railway URL + `/api` (e.g., `https://your-backend.up.railway.app/api`)

**Important:** Since `NEXT_PUBLIC_API_URL` is baked into the client bundle at build time, set it **before** the first deploy. If you change it later, trigger a redeploy.

### 5. Generate domains

For both backend and frontend services, go to **Settings** > **Networking** > **Generate Domain** to get public URLs.

### Default login

After first deploy: `admin@cdpcrm.com` / `admin123`

---

## AI Agent Integration

The AI agent authenticates via API key (`X-API-Key` header) and uses the same REST API:

```bash
# Log an outreach activity
curl -X POST http://localhost:8000/api/activities \
  -H "X-API-Key: crm_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"type": "email", "subject": "Intro email", "account_id": "...", "performed_by": "..."}'

# Add a contact
curl -X POST http://localhost:8000/api/contacts \
  -H "X-API-Key: crm_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"account_id": "...", "first_name": "Jane", "last_name": "Doe", "email": "jane@example.com"}'

# Suggest a follow-up
curl -X POST http://localhost:8000/api/follow-ups \
  -H "X-API-Key: crm_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"assigned_to": "...", "subject": "Re: Partnership", "body": "Hi Jane, ...", "source": "ai_agent"}'
```

## API Endpoints

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me` |
| Users | `GET /api/users`, `POST /api/users`, `GET/PATCH /api/users/{id}` |
| Accounts | `GET /api/accounts`, `POST`, `GET/PATCH/DELETE /api/accounts/{id}` |
| Contacts | `GET /api/contacts`, `POST`, `GET/PATCH/DELETE /api/contacts/{id}` |
| Activities | `GET /api/activities`, `POST`, `GET /api/activities/{id}` |
| Notes | `GET /api/notes`, `POST`, `PATCH/DELETE /api/notes/{id}` |
| Follow-ups | `GET /api/follow-ups`, `POST`, `GET/PATCH /api/follow-ups/{id}` |
| Dashboard | `GET /api/dashboard/stats` |
