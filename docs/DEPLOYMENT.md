# NexusERP Deployment Guide

## Prerequisites

- Node.js >= 18
- PostgreSQL 14+
- Yarn 1.22+

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://user:password@host:5432/nexuserp?schema=public"
```

## Production Build

```bash
# Install dependencies
yarn install --frozen-lockfile

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Build the application
yarn build

# Start production server
yarn start
```

The application will be available at `http://localhost:3000`.

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN yarn build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: nexuserp
      POSTGRES_USER: nexus
      POSTGRES_PASSWORD: nexus_secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://nexus:nexus_secret@db:5432/nexuserp?schema=public
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  pgdata:
```

## Cloud Deployment

### Vercel

1. Connect your repository to Vercel
2. Set the `DATABASE_URL` environment variable in project settings
3. Add build command: `npx prisma generate && yarn build`
4. Deploy

### Railway / Render

1. Create a PostgreSQL database service
2. Create a web service from the repository
3. Set `DATABASE_URL` to the database connection string
4. The app will auto-deploy on push

## Post-Deployment

### Initialize Database

```bash
# Push schema to database
npx prisma db push

# (Optional) Seed with demo data
curl -X POST https://your-domain.com/api/seed
```

### Verify

```bash
# Health check
curl https://your-domain.com/api/dashboard

# Login
curl -X POST https://your-domain.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yourcompany.com"}'
```

## Monitoring

- **Audit Logs**: All operations are logged. Query via `GET /api/audit-logs`.
- **Error Handling**: All API routes return structured error responses with HTTP status codes.
- **Database**: Use Prisma Studio for database inspection: `npx prisma studio`.
