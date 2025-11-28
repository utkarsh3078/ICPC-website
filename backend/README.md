ICPC USICT Portal – Backend
🚀 Express.js + TypeScript Backend for ACM ICPC USICT Portal
<p align="center"> <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" /> <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" /> <img src="https://img.shields.io/badge/Express.js-5-black?style=for-the-badge&logo=express" /> <img src="https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql" /> <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" /> <img src="https://img.shields.io/badge/Judge0-Integration-red?style=for-the-badge" /> <img src="https://img.shields.io/badge/Swagger-API Docs-yellow?style=for-the-badge&logo=swagger" /> <br/> <img src="https://img.shields.io/github/actions/workflow/status/yourusername/icpc-website/ci.yml?style=flat-square&label=CI" /> <img src="https://img.shields.io/github/license/yourusername/icpc-website?style=flat-square" /> </p>
📘 Overview

A robust Express.js + TypeScript backend powering the ACM ICPC USICT Portal.
Includes features such as contests, tasks, blogs, alumni portal, Judge0 code execution, gamification, sessions, and AI-powered tools.

This backend is production-ready with containerized deployment, CI/CD, logging, cron jobs, Prisma ORM, Swagger API docs, and over 80% test coverage.

📚 Table of Contents

Features

Tech Stack

Prerequisites

Quick Start

Project Structure

Configuration

API Documentation

Development

Testing

Deployment

Scripts Reference

Contributing

License

Support

✨ Features
🔐 Core

JWT authentication (Student, Admin, Alumni)

Contest creation + problem submissions

Task/assignment system with LC/CF link verification

Judge0 integration for code execution in 50+ languages

Profile management & coding handles

🧩 Advanced

Gamification: badges, leaderboard, streaks

Blog system with admin approval

Session/workshop management

Alumni network with role-specific access

AI-powered coding assistant (OpenAI)

⚙️ Technical Highlights

Prisma ORM + PostgreSQL

Pino structured logging

Cron jobs for leaderboard updates + Judge0 polling

Swagger UI interactive API docs

Dockerized production build

80% unit & integration test coverage

🛠 Tech Stack
Category	Technologies
Runtime	Node.js 18+, TypeScript 5.x
Framework	Express.js, Helmet, CORS, Rate Limiting
Database	PostgreSQL 15+, Prisma ORM
Auth	JWT, bcrypt
Testing	Jest, Supertest
External APIs	Judge0 CE, OpenAI
DevOps	Docker, GitHub Actions
📦 Prerequisites

Node.js 18+

PostgreSQL 15+

npm/pnpm

Git

🚀 Quick Start
1. Clone & Install
git clone https://github.com/yourusername/icpc-website.git
cd icpc-website/backend
npm install

2. Environment Setup
cp .env.example .env

3. Database Setup
npx prisma generate
npx prisma migrate dev --name init
npm run seed        # admin@icpc.local / admin1234

4. Start Dev Server
npm run dev


🔗 Visit:
http://localhost:5000/api/health

📁 Project Structure
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   ├── jobs/
│   ├── utils/
│   ├── tests/
│   ├── index.ts
│   └── testApp.ts
├── prisma/
├── docs/
├── Dockerfile
├── docker-compose.yml
├── swagger.json
├── API_DOCUMENTATION.md
└── README.md

⚙️ Configuration
Required .env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/icpc_portal"
JWT_SECRET="your-32-char-secret"
PORT=5000

# Optional
JUDGE0_URL="https://judge0-ce.p.rapidapi.com"
OPENAI_API_KEY="sk-xxxx"
LOG_LEVEL="info"


🔐 Security

JWT secret must be ≥32 characters

Weak secrets are rejected during startup

📖 API Documentation
🧭 Swagger UI

➡ http://localhost:5000/api/docs/ui

Quick Reference
Endpoint	Method	Auth	Description
/api/auth/register	POST	❌	Register
/api/auth/login	POST	❌	Login
/api/profile	POST	✅ User	Update profile
/api/tasks	POST	✅ Admin	Create task
/api/tasks/:id/submit	POST	✅ User	Submit task
/api/contests/:id/submit	POST	✅ User	Submit code
/api/judge/submit	POST	✅ User	Code execution
/api/gamification/leaderboard	GET	❌	View leaderboard
💻 Development
Scripts
npm run dev
npm run build
npm start

# Database
npm run prisma:generate
npm run prisma:migrate
npm run seed

# Testing
npm test
npm run test:unit
npm run test:integration

# Judge0 test
npm run demo

🧪 Testing

Tests are divided into unit and integration:

tests/
├── unit/
└── integration/

Commands
npm test
npm run test:unit
npm run test:integration


📌 Integration tests require DATABASE_URL_TEST in .env.test

🚢 Deployment
Docker Build
docker build -t icpc-backend .

Run
docker run -p 5000:5000 icpc-backend

Docker Compose
docker-compose up

Production Checklist

 NODE_ENV=production

 Strong JWT secret

 HTTPS enabled

 Run prisma migrate deploy

 Enable logging & rate limits

🤝 Contributing

Pull requests are welcome!

Steps

Fork → Clone

git checkout -b feature/your-feature

Implement + test

Update docs

Open PR

Coding Standards

TypeScript strict mode

No any unless justified

Use service layer for business logic

Pino logging

80%+ test coverage

📄 License

This project is licensed under the ISC License.

📞 Support

📘 Documentation: API_DOCUMENTATION.md

🐞 Issues: GitHub Issues

📧 Email: support@icpc-usict.edu (replace as needed)