# School ERP — Backend API

Complete NestJS REST API for the School ERP Management System.

## Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 (TypeScript) |
| ORM | Prisma 5 + PostgreSQL |
| Auth | JWT (access + refresh) via Redis |
| Queue | BullMQ + Bull Board |
| Real-time | Socket.IO |
| Files | AWS S3 (multer + signed URLs) |
| Docs | Swagger / OpenAPI 3.0 |
| Scheduler | @nestjs/schedule (cron jobs) |
| Logger | Winston |

---

## Quick Start

### 1. Prerequisites

- Node.js ≥ 20
- Docker + Docker Compose (for Postgres + Redis)
- npm ≥ 10

### 2. Clone & Install

```bash
git clone https://github.com/yourorg/school-erp.git
cd school-erp/apps/api
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET at minimum
```

### 4. Start Infrastructure (Docker)

```bash
# From monorepo root
docker compose up -d postgres redis
```

### 5. Database Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed
```

### 6. Run Dev Server

```bash
npm run dev
# API: http://localhost:3001/api
# Swagger: http://localhost:3001/api/docs
# Bull Board: http://localhost:3002 (if running separately)
```

---

## Project Structure

```
src/
├── main.ts                    # Bootstrap (Helmet, CORS, Swagger, ValidationPipe)
├── app.module.ts              # Root module
├── app.controller.ts          # GET /health
│
├── common/
│   ├── prisma/                # PrismaService (global)
│   ├── redis/                 # RedisService (global)
│   ├── logger/                # WinstonLogger
│   ├── filters/               # HttpExceptionFilter → standard error shape
│   ├── interceptors/          # TransformInterceptor + AuditInterceptor
│   ├── guards/                # JwtAuthGuard + RbacGuard
│   ├── decorators/            # @Roles(), @Public(), @CurrentUser()
│   ├── storage/               # S3Service (global)
│   └── utils/                 # response.util, crypto.util
│
├── modules/
│   ├── auth/                  # Login, Refresh, Logout, OTP, Password reset
│   ├── student/               # Full CRUD + documents upload
│   ├── faculty/               # CRUD + subject assignments + timetable
│   ├── attendance/            # Mark (upsert) + 24h edit + monthly reports
│   ├── academic/              # Years, Classes, Sections, Subjects, Timetable
│   ├── exam/                  # Exams, Schedules, Bulk Marks, Results, Rank
│   ├── fee/                   # Structures, Collection, Online Pay, Concession
│   ├── assignment/            # Create, Submit (S3), Grade
│   ├── library/               # Catalog, Issue, Return (fine calc)
│   ├── notice/                # Notices, Direct Messages, Bulk Notify
│   ├── grievance/             # Submit, Track, Update status
│   ├── hr/                    # Leave apply/approve, Payroll config/run, Holidays
│   └── analytics/             # KPIs, Attendance trends, Performance, Fee stats
│
├── jobs/
│   ├── jobs.module.ts         # Bull queue registrations
│   ├── payroll.processor.ts   # Monthly payroll computation
│   ├── notification.processor.ts  # Email/SMS/Push workers
│   ├── report-card.processor.ts   # PDF generation (Puppeteer)
│   └── scheduled.tasks.ts     # Daily/weekly cron jobs
│
└── gateway/
    └── events.gateway.ts      # Socket.IO: notices, attendance, messages, GPS
```

---

## Authentication Flow

```
POST /api/auth/login
  → { accessToken (15m), refreshToken (7d), user }

POST /api/auth/refresh
  → { accessToken, refreshToken }

POST /api/auth/logout
  → invalidates refresh token in Redis

POST /api/auth/forgot-password
  → sends 6-digit OTP via email/SMS (10min TTL in Redis)

POST /api/auth/reset-password
  → verifies OTP → updates password → revokes all tokens
```

All protected routes require:
```
Authorization: Bearer <accessToken>
```

---

## RBAC Roles

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Everything |
| `INSTITUTION_ADMIN` | All institutional operations |
| `PRINCIPAL` | Academic + HR oversight |
| `HOD` | Department-level academic |
| `FACULTY` | Own classes, attendance, assignments |
| `STUDENT` | Own data only |
| `PARENT` | Own child's data |
| `ACCOUNTANT` | Fee collection, reports |
| `LIBRARIAN` | Book catalog, issue, return |
| `HR_MANAGER` | Payroll, leaves |
| `HOSTEL_WARDEN` | Hostel management |
| `TRANSPORT_MANAGER` | Routes, passes |
| `RECEPTIONIST` | Admissions, student registration |

---

## Standard Response Shapes

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2024-01-01T00:00:00.000Z" }
}
```

### Paginated
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [ ... ]
  },
  "meta": { "timestamp": "...", "path": "/api/..." }
}
```

---

## API Endpoints Summary

| Module | Key Endpoints |
|---|---|
| Auth | `POST /auth/login` `POST /auth/refresh` `POST /auth/logout` |
| Students | `GET/POST /students` `GET/PUT/DELETE /students/:id` |
| Faculty | `GET/POST /faculty` `POST /faculty/:id/assign-subjects` |
| Attendance | `POST /attendance/mark` `GET /attendance/report/monthly` |
| Academic | `GET/POST /academic/years` `GET/POST /academic/classes` `POST /academic/timetable` |
| Exams | `POST /exams` `POST /exams/marks` `GET /exams/results/student/:id` |
| Fees | `POST /fees/collect` `GET /fees/student/:id/dues` `POST /fees/pay-online` |
| Assignments | `POST /assignments` `POST /assignments/:id/submit` `PUT /assignments/submissions/:id/grade` |
| Library | `GET /library/books` `POST /library/issue` `POST /library/return` |
| Notices | `POST /notices` `GET /notices` `POST /notices/messages` |
| Grievances | `POST /grievances` `GET /grievances` `PUT /grievances/:id` |
| HR | `POST /hr/leaves` `PUT /hr/leaves/:id/approve` `POST /hr/payroll/run` |
| Analytics | `GET /analytics/dashboard-kpis` `GET /analytics/attendance-trends` |

Full Swagger docs at: **http://localhost:3001/api/docs**

---

## WebSocket Events

Connect with JWT:
```js
const socket = io('http://localhost:3001', {
  auth: { token: '<accessToken>' }
});
```

| Event (server → client) | Payload |
|---|---|
| `notice:new` | `{ id, title, body, priority, category }` |
| `attendance:marked` | `{ classId, sectionId, summary }` |
| `message:received` | `{ id, senderId, body, createdAt }` |
| `grievance:updated` | `{ id, status, resolution }` |
| `bus:location` | `{ routeId, lat, lng }` |

| Event (client → server) | Payload |
|---|---|
| `join:class` | `{ classId, sectionId }` |

---

## Cron Jobs

| Job | Schedule | Description |
|---|---|---|
| `attendance-alert` | Daily 8 AM | SMS parents of absent students |
| `fee-reminder` | Every Monday 9 AM | Email fee defaulters |
| `document-expiry` | Every Sunday 10 AM | Alert for contracts expiring in 30 days |
| `payroll-run` | On-demand (via API) | Monthly salary computation |

---

## Seed Credentials

After running `npm run db:seed`:

```
Super Admin : admin@school.edu.in       / Admin@1234
Faculty     : priya.sharma@demoschool.edu.in / Faculty@2024
Student     : arjun.mehta@student.school.in  / Student@2008
```

---

## Verification

```bash
# TypeScript compile check (no DB needed)
npx tsc --noEmit

# Build check
npm run build

# After docker compose up + migrate + seed:
curl http://localhost:3001/api/health
# → { "status": "ok", "services": { "database": "up", "redis": "up" } }

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"bad"}'
# → 401 UNAUTHORIZED with standard error shape

curl http://localhost:3001/api/students
# → 401 UNAUTHORIZED (no token)
```
