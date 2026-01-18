# Expense Tracker (Fenmo Assignment)

A minimal, production-quality full-stack Expense Tracker built with Next.js API routes, PostgreSQL, and Prisma.

## Project Overview
This app lets a user record expenses and review them with filters, sorting, totals, and a summary by category. It is designed to behave correctly under real-world conditions like retries, page refreshes, and slow networks.

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

## How It Works
- **Frontend** posts expenses to `/api/expenses` and renders the list.
- **Backend** validates input, converts money to paise, and writes to PostgreSQL.
- **Idempotency** prevents duplicate expenses when a user retries the same request.

## Project Structure
- `app/page.tsx`: main page and data flow
- `app/components/ExpenseForm.tsx`: create form + retry-safe messaging
- `app/components/ExpenseList.tsx`: list/table view
- `app/components/Filters.tsx`: category and sort controls
- `app/components/Summary.tsx`: total per category
- `app/api/expenses/route.ts`: POST/GET API handlers
- `lib/db.ts`: money/date parsing utilities
- `lib/prisma.ts`: Prisma client setup
- `prisma/schema.prisma`: data model

## Design Decisions
- **Money handling:** stored as integer paise (`amountPaise`) to avoid floating-point errors.
- **Idempotency:** unique `idempotencyKey` on every POST to ensure retries don’t create duplicates.
- **Dates:** normalized to UTC date boundaries to avoid timezone drift.
- **Persistence choice:** PostgreSQL with Prisma for reliable storage, strong consistency, and safe concurrent writes.

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

## Troubleshooting
- **Database connection errors:** verify `DATABASE_URL` and that your DB allows inbound connections.
- **Prisma table missing:** run `npm run prisma:migrate`.
- **Module not found for `@/*`:** ensure `tsconfig.json` has the path alias configured.

## Trade-offs
- No auth or multi-user support due to the timebox.
- No end-to-end tests; focused on core correctness and small unit tests.
