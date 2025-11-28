# Backend

Express + TypeScript backend server for ICPC Website.

This project implements a modular backend with Prisma + PostgreSQL, JWT auth, role-based access, cron jobs, and OpenAI integration (optional).

## Setup

1. Copy `.env.example` to `.env` and update values (Postgres URL, JWT secret, OpenAI key optional).

2. Install dependencies:

```powershell
cd "c:\Users\utkyd\Documents\WEB DEVELOPMENT\ICPC-website\backend"
npm install
```

3. Generate Prisma client & run migrations:

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed sample data (creates an admin placeholder):

```powershell
npm run seed
```

5. Run in development:

```powershell
npm run dev
```

## Quick API reference

- `GET /api/health` - health check
- `POST /api/auth/register` - register user (student/alumni)
- `POST /api/auth/login` - login to receive JWT
- `POST /api/auth/approve/:id` - admin approves user
- `POST /api/profile` - create/update profile (auth required)
- `POST /api/tasks/:taskId/submit` - submit task completion (auth)
- `POST /api/ai/chat` - AI chatbot (auth)

For more endpoints see `src/routes`.

## Notes

- After updating Prisma schema, run `npx prisma generate` and `npx prisma migrate dev`.
- The OpenAI integration uses `OPENAI_API_KEY` from the environment; if not provided, the AI route returns a placeholder.

## Swagger UI

Open the API docs UI at: `http://localhost:5000/api/docs/ui`

## Postman

Import `postman_collection.json` to test endpoints quickly. Use the `{{token}}` and `{{admin_token}}` variables for Authorization.

## Testing (integration)

To run integration tests you should provide a test database. Steps:

1. Copy `.env.test.example` to `.env.test` and update `DATABASE_URL_TEST`.
2. Apply migrations to your test DB (locally):

```powershell
npx prisma migrate dev --schema=./prisma/schema.prisma --name test_init
```

3. Run tests:

```powershell
npm test
```

Note: integration tests in `tests/integration` are templates that skip if `DATABASE_URL_TEST` is not configured.

