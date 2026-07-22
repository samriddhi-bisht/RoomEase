# RoomEase

**Find your space. Find your roomie.**

RoomEase is a PG/flat listing and roommate-matching platform built for college students
relocating to a new city. Both owners and students go through a KYC verification step
before they can list a place or connect with each other, so listings and roommate
profiles are trustworthy instead of anonymous.

This is a learning-focused, from-scratch build: Node/Express backend, PostgreSQL with
raw SQL (no ORM), server-rendered EJS views, jQuery for AJAX. 

---

## Features

- **Auth** — signup/login with bcrypt-hashed passwords, JWT stored in an httpOnly cookie
- **Role-based access** — student / owner / admin, enforced via middleware
- **KYC verification** — document upload, OCR-assisted name/ID checks (Tesseract.js),
  final approval always by a human admin
- **Listings** — CRUD with photo upload, amenities, nearby colleges, gender preference
- **Search & discovery** — filter by college, budget, gender preference, amenities
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
| Backend | Node.js + Express |
| Views | EJS (server-rendered) |
| Frontend interactivity | jQuery, AJAX against the REST API |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs`, JWT delivered via httpOnly cookie |
| File uploads | Multer |
| KYC OCR | Tesseract.js |
| Validation | express-validator |

---

## Getting started

**Prerequisites:** Node.js, PostgreSQL, both installed and running locally.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env — set DB_PASSWORD to your local Postgres password at minimum

# 3. Create the database and all tables
npm run migrate

# 4. Load reference data (colleges, amenities)
npm run seed

# 5. Start the dev server (auto-restarts on file changes)
npm run dev
```

Then open **http://localhost:3000**.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the server with nodemon (auto-restart) |
| `npm start` | Start the server without auto-restart |
| `npm run migrate` | Create the database (if missing) and apply any new SQL migrations |
| `npm run seed` | Insert sample colleges and amenities (safe to re-run) |

---

## Project structure

```
app.js                      entry point — wires everything together
config/db.js                 Postgres connection pool
db/                          migrations, migration runner, seed script
middleware/                  auth, role checks, KYC gate, validation, uploads, errors
models/                      raw SQL data access, one file per table
services/                    business logic layer
validators/                  express-validator rule chains
controllers/                 request/response glue
routes/api/v1/               versioned JSON REST API
routes/pages.js               EJS page routes
views/                       EJS templates
public/                      CSS, client-side JS, uploaded files
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