# Expense Tracker (Fenmo Assignment)

A minimal, production-quality full-stack Expense Tracker built with Next.js API routes, PostgreSQL, and Prisma.

## Tech Stack
- **Frontend:** Next.js (App Router)
- **Backend:** Next.js API routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Hosting:** Vercel

## Features
- Create expenses (amount, category, description, date)
- List expenses
- Filter by category
- Sort by date (newest first)
- Total for the current list
- Summary by category (based on the current list)
- Retry-safe POSTs via idempotency keys
- Basic validation and loading/error states in the UI

## Design Decisions
- **Money handling:** stored as integer paise (`amountPaise`) to avoid floating-point errors.
- **Idempotency:** unique `idempotencyKey` on every POST to ensure retries don’t create duplicates.
- **Dates:** normalized to UTC date boundaries to avoid timezone drift.

## API
### POST `/api/expenses`
**Body**
```json
{
  "idempotencyKey": "uuid",
  "amount": 250.75,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-01-15"
}
```
**Behavior**
- Validates inputs
- Converts amount → paise
- Returns existing record if the idempotency key already exists

### GET `/api/expenses`
**Query params**
- `category=Food`
- `sort=date_desc`

## Local Setup
```bash
npm install
npm run prisma:generate
```

Set `DATABASE_URL` in `.env` (PostgreSQL connection string), then run:
```bash
npm run prisma:migrate
npm run dev
```

Open `http://localhost:3000`.

## Tests
```bash
npm run test
```

## Trade-offs
- No auth or multi-user support (out of scope).

## What Was Skipped (Intentional)
- End-to-end tests (would add Playwright)
