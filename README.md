# ERP School Management System

This is a production-grade ERP School Management System monorepo, providing a strong foundation for multiple portals using Next.js, Express/NestJS, Prisma, and Tailwind CSS.

## Architecture

- **Frontend (`apps/web`)**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Zustand, React Query, Recharts, Framer Motion
- **Backend (`apps/api`)**: Node.js, Express/NestJS, PostgreSQL, Redis, Socket.IO, BullMQ
- **Database**: PostgreSQL (Prisma ORM)

## Portals
- Student Portal (`/student`)
- Faculty Portal (`/faculty`)
- Management Portal (`/management`)
- Parent Portal (`/parent`)

## Prerequisites
- Node.js >= 18.x
- Docker & Docker Compose
- pnpm (recommended) or npm

## Development Setup

1. **Environment Setup**
    ```sh
    cp .env.example .env
    ```

2. **Start Infrastructure Services**
    ```sh
    docker-compose up -d
    ```
    This starts PostgreSQL, Redis, MinIO (S3), and Mailpit.

3. **Install Dependencies**
    ```sh
    pnpm install
    # or npm install
    ```

4. **Database Migration**
    ```sh
    cd apps/api
    npx prisma generate
    npx prisma db push
    ```

5. **Start Development Servers**
    ```sh
    pnpm dev
    ```

## Design System
Refer to `apps/web/tailwind.config.ts` for standardized color palletes, typography, and spacing scales.





## Production (single VM + Docker Compose)

### What you deploy
- **Postgres + Redis**
- **API** (`apps/api`) on port `3001` (behind Nginx)
- **Web** (`apps/web`) on port `3000` (behind Nginx)
- **Nginx** terminates HTTP/HTTPS and proxies `/api` to API

### 1) VM prerequisites
- Docker + docker-compose
- Open ports `80` and `443`
- A domain pointing to the VM

### 2) Configure environment

```sh
cp .env.prod.example .env.prod
```

Edit `.env.prod` and set at minimum:
- `POSTGRES_PASSWORD`, `REDIS_PASSWORD`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`, `WEB_URL`, `NEXT_PUBLIC_API_URL`

### 3) Start production stack

```sh
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4) Run DB migrations (required on every deploy)

```sh
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

Optional: seed demo data (only for a demo environment):

```sh
docker-compose -f docker-compose.prod.yml exec api npm run db:seed
```

### 5) Health checks
- API health: `GET /api/health`
- API readiness: `GET /readyz` (returns **503** if DB/Redis are down)
