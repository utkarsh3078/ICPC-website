# Demo: Submitting code and polling results

This file shows example `curl` and PowerShell requests to use the Judge0 endpoints and the contest submission endpoint in this project.

1. Direct Judge0 submit (via our proxy controller)

curl (bash):

```bash
curl -X POST "http://localhost:5000/api/judge/submit" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"source":"print(\"hello\")","language_id":71}'
```

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/judge/submit" -Headers @{ Authorization = "Bearer <TOKEN>" } -Body (@{ source = 'print("hello")'; language_id = 71 } | ConvertTo-Json) -ContentType 'application/json'
```

Response will include a `token` which you can poll:

```bash
curl "http://localhost:5000/api/judge/result/<TOKEN>" -H "Authorization: Bearer <TOKEN>"
```

2. Submit a solution to a contest (our contest submission flow)

```bash
curl -X POST "http://localhost:5000/api/contests/<CONTEST_ID>/submit" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"source":"#include <bits/stdc++.h>\nint main(){printf("hi");}","language_id":53,"problemIdx":0}'
```

PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/contests/<CONTEST_ID>/submit" -Headers @{ Authorization = "Bearer <TOKEN>" } -Body (@{ source = '#include <bits/stdc++.h>\nint main(){printf("hi");}'; language_id = 53; problemIdx = 0 } | ConvertTo-Json) -ContentType 'application/json'
```

Notes:

- Replace `<TOKEN>` with a valid JWT from the login endpoint.
- Replace `<CONTEST_ID>` with a contest id from the `GET /api/contests` endpoint.
  -- Judge0 language IDs differ between providers — adjust `language_id` as needed.

Environment variables:

- `JUDGE0_URL` — base URL for Judge0 (default uses the public CE endpoint). Example: `https://judge0-ce.p.rapidapi.com`
- `JUDGE0_KEY` — optional API key for Judge0 (RapidAPI key or Provider token). If set, the demo and service will send it as the header named by `JUDGE0_KEY_HEADER` (defaults to `X-RapidAPI-Key`).
- `JUDGE0_KEY_HEADER` — header name for the key (defaults to `X-RapidAPI-Key`).

Example `.env` entries:

```
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_KEY=sk-REPLACE_ME
JUDGE0_KEY_HEADER=X-RapidAPI-Key
```

Quick Docker Postgres (local) for testing:

```powershell
docker run --name icpc-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=icpc_website -p 5432:5432 -d postgres:15
```

Create DB schema and seed data (from `backend`):

```powershell
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

Run server and demo:

```powershell
npm run dev
npm run demo
```

Fetch a specific submission (owner or admin):

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/contests/submissions/<SUBMISSION_ID>
```

Run unit tests only (fast, mocks services):

```powershell
npm run test:unit
```

Run integration tests (requires DB + migrations):

```powershell
npm run test:integration
```
