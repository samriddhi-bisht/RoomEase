# RoomEase

**Find your space. Find your roomie.**

RoomEase is a PG/flat listing and roommate-matching platform built for college students
relocating to a new city. Both owners and students go through a KYC verification step
before they can list a place or connect with each other, so listings and roommate
profiles are trustworthy instead of anonymous.

This is a learning-focused, from-scratch build: Node/Express + PostgreSQL (raw SQL, no
ORM) REST API, with a standalone React frontend in [`client/`](client/README.md). The
API and the frontend run as two separate local servers — see **Getting started** below.

> The original server-rendered EJS/jQuery pages under `views/` and `public/` still work
> and are left in place, but the React app in `client/` is now the primary frontend.

---

## Features

- **Auth** — signup/login with bcrypt-hashed passwords, JWT stored in an httpOnly cookie
- **Role-based access** — student / owner / admin, enforced via middleware
- **KYC verification** — document upload, OCR-assisted name/ID checks (Tesseract.js),
  final approval always by a human admin
- **Listings** — CRUD with photo upload, amenities, nearby colleges, gender preference,
  property type (PG/flat/hostel/studio/room), furnishing and sharing type
- **Search & discovery** — e-commerce-style filter sidebar: city/area, property type,
  price range slider, sharing type, furnishing, gender preference, amenities, sort
- **Roommate matching** — student profiles, browse, and connection requests
- **Reviews & ratings** — one review per user per listing
- **Admin panel** — KYC approval queue, listing moderation

> KYC here is a **simulated, educational pipeline** (OCR + rule-based checks + manual
> admin review) — not a licensed identity-verification service. A real deployment would
> need a provider like DigiLocker.

---

## Tech stack

| Layer | Choice |
|---|---|
| Database | PostgreSQL, raw SQL via `pg` (no ORM — every join/transaction is hand-written) |
| Backend | Node.js + Express, running on `:3000` |
| Frontend | React + Vite + Tailwind CSS, running standalone on `:5173` (see `client/`) |
| Legacy views | EJS (server-rendered), still served by Express but no longer the primary UI |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs`, delivered via httpOnly cookie, read cross-origin with CORS credentials |
| File uploads | Multer |
| KYC OCR | Tesseract.js |
| Validation | express-validator |

---

## Getting started

**Prerequisites:** Node.js, PostgreSQL, both installed and running locally.

The API and the React frontend are two separate apps — run **both**, each in its own
terminal.

### 1. API server (`:3000`)

```bash
# From the repo root
npm install

cp .env.example .env
# then edit .env — set DB_PASSWORD to your local Postgres password at minimum

npm run migrate   # create the database (if missing) and apply SQL migrations
npm run seed       # load demo colleges, amenities, listings, users

npm run dev         # starts the API at http://localhost:3000
```

### 2. Frontend (`:5173`)

```bash
# In a second terminal, from the repo root
cd client
npm install
npm run dev         # starts the React app at http://localhost:5173
```

Open **http://localhost:5173** — that's the app. It talks to the API at `:3000` over
CORS (configured via `CLIENT_ORIGIN` in the root `.env`). Demo accounts seeded by
`npm run seed` all share the password `Demo@1234` (e.g. `rohit.kumar@student.demo`,
`anita.verma@owner.demo`).

### Scripts

**Root (API):**

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with nodemon (auto-restart) |
| `npm start` | Start the API without auto-restart |
| `npm run migrate` | Create the database (if missing) and apply any new SQL migrations |
| `npm run seed` | Insert sample colleges, amenities, listings and users (safe to re-run) |

**`client/` (frontend):**

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server at `:5173` |
| `npm run build` | Production build to `client/dist` |
| `npm run preview` | Preview the production build locally |

---

## Project structure

```
app.js                      API entry point — wires everything together
config/db.js                 Postgres connection pool
db/                          migrations, migration runner, seed script
middleware/                  auth, role checks, KYC gate, validation, uploads, errors
models/                      raw SQL data access, one file per table
services/                    business logic layer
validators/                  express-validator rule chains
controllers/                 request/response glue
routes/api/v1/               versioned JSON REST API
routes/pages.js               legacy EJS page routes
views/                       legacy EJS templates
public/                      legacy CSS/client-side JS, plus uploaded files (still served)

client/                      React frontend (primary UI) — see client/README.md
client/src/api/               one module per API resource (axios)
client/src/context/           AuthContext (session via httpOnly cookie)
client/src/components/       layout shell, UI primitives, listing components
client/src/pages/             route-level pages
```

---

## API overview

All endpoints are under `/api/v1`:

| Resource | Base path |
|---|---|
| Auth | `/api/v1/auth` (signup, login, logout, me) |
| KYC | `/api/v1/kyc` (submit, my documents, pending, review) |
| Listings | `/api/v1/listings` (CRUD, owner's own listings) |
| Search | `/api/v1/search` (filtered browse, filter options) |
| Roommates | `/api/v1/roommates` (profile, browse) |
| Connections | `/api/v1/connections` (send, respond, list) |
| Reviews | `/api/v1/listings/:listingId/reviews` |
| Admin | `/api/v1/admin` (listing moderation) |

Sensitive actions are gated by middleware chains, e.g. creating a listing requires
`requireAuth → requireRole('owner') → requireKycVerified` before the request even reaches
validation or the controller.

---

## Roles

| Role | Can do |
|---|---|
| **Student** | Browse/search listings, save/shortlist, roommate matching, connection requests, reviews — roommate/connection features require KYC verification |
| **Owner** | List and manage PGs/flats (requires KYC verification), respond to interest |
| **Admin** | Approve/reject KYC submissions, moderate listings — admin accounts are seeded directly, never created via public signup |

---