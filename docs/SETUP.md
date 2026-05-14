# NexusERP Setup Guide

Complete step-by-step guide to getting NexusERP running locally and in production.

## Prerequisites

1. **Node.js** 18+ — [Download](https://nodejs.org/)
2. **Yarn** (recommended) or npm — `npm install -g yarn`
3. **PostgreSQL** 14+ — Install locally or use a cloud provider

---

## PostgreSQL Installation

### macOS

```bash
brew install postgresql@14
brew services start postgresql@14
createdb nexus_erp
```

### Ubuntu / Debian

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-client
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql -c "CREATE USER nexus WITH PASSWORD 'nexus123' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE nexus_erp OWNER nexus;"
```

### Windows

Download the PostgreSQL installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/). During installation:
1. Set a superuser password
2. Keep the default port (5432)
3. After install, open **pgAdmin** and create a database named `nexus_erp`

### Cloud PostgreSQL (Free Tier)

1. Go to [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a free project
3. Copy the connection string — it will look like:
   ```
   postgresql://user:password@host:5432/nexus_erp?sslmode=require
   ```

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/kavin680/-NexusERP.git
cd -NexusERP

# 2. Install dependencies
yarn install                # or: npm install

# 3. Configure environment
cp .env.example .env
```

Edit `.env` with your database connection:

```env
# For local PostgreSQL:
DATABASE_URL="postgresql://nexus:nexus123@localhost:5432/nexus_erp"

# For Neon / Supabase (cloud):
# DATABASE_URL="postgresql://user:password@host:5432/nexus_erp?sslmode=require"
```

```bash
# 4. Run Prisma migration (creates all tables)
npx prisma migrate dev

# 5. Generate Prisma client
npx prisma generate
```

---

## Running the Application

### Development Mode

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The app hot-reloads on file changes.

### Production Mode

```bash
yarn build
yarn start
```

---

## Demo Data

The application automatically seeds the database with demo data on first load via `POST /api/seed`.

### What Gets Seeded

| Resource         | Count | Examples                                           |
|------------------|-------|----------------------------------------------------|
| Companies        | 4     | Al Bashir Trading, JV Projects, Kuwait, Lanka      |
| Users            | 8     | All roles: SUPER_ADMIN, ADMIN, SALES, etc.         |
| Customers        | 7     | Dubai Marina Developers, Lanka Construction, etc.  |
| Suppliers        | 7     | Emirates Steel, Gulf Pipes, Lanka Hardware, etc.   |
| Quotations       | 9     | AED and LKR currencies, various statuses           |
| Supplier Quotes  | 7     | Linked to quotations, PENDING/ACCEPTED/REJECTED    |
| Purchase Orders  | 6     | DRAFT, SENT, RECEIVED statuses                     |
| Delivery Orders  | 5     | PENDING, DISPATCHED, DELIVERED statuses             |
| Invoices         | 7     | PAID, UNPAID, PARTIAL, OVERDUE, VOID               |
| Expenses         | 12    | MATERIAL, LABOR, TRANSPORT, ADMIN, SUBCONTRACT, SITE_VISIT |
| Audit Logs       | 11    | LOGIN, CREATED, REVISED, UPDATED actions           |

### Manual Seeding

```bash
# Seed (idempotent — skips if data already exists)
curl -X POST http://localhost:3000/api/seed

# Reset all data and re-seed
curl -X POST "http://localhost:3000/api/seed?reset=1"
```

---

## Demo Login Credentials

All demo accounts use password: **`password123`**

| Name             | Email                | Role          | Company                  |
|------------------|----------------------|---------------|--------------------------|
| Ahmed Al Bashir  | ahmed@albashir.ae    | SUPER_ADMIN   | Al Bashir Trading LLC    |
| Sara Khan        | sara@albashir.ae     | ADMIN         | Al Bashir Trading LLC    |
| Omar Farouk      | omar@albashir.ae     | SALES         | Al Bashir Trading LLC    |
| Fatima Noor      | fatima@albashir.ae   | PROCUREMENT   | Al Bashir JV Projects    |
| Hassan Raza      | hassan@albashir.ae   | ACCOUNTANT    | Al Bashir Trading LLC    |
| Layla Abbas      | layla@albashir.ae    | VIEWER        | Al Bashir Kuwait Branch  |
| Kavindu Perera   | kavindu@nexuslk.lk   | ADMIN         | NexusERP Lanka (Pvt) Ltd |
| Nimal Silva      | nimal@nexuslk.lk     | SALES         | NexusERP Lanka (Pvt) Ltd |

---

## Prisma Commands

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio

# Run pending migrations
npx prisma migrate dev

# Reset database and reapply all migrations
npx prisma migrate reset

# View current migration status
npx prisma migrate status

# Generate Prisma client after schema changes
npx prisma generate

# Format schema file
npx prisma format
```

---

## Key Workflows

### 1. Quotation → PO → DO → Invoice

```
Create Quotation → Approve → Generate PO (from row actions) → Generate DO → Create Invoice
```

- Quotation numbers: `{CompanyCode}-Q-YYYY-seq`
- PO numbers: `{CompanyCode}-PO-YYYY-seq`
- DO numbers: `{CompanyCode}-DO-YYYY-seq`
- Invoice numbers: `{CompanyCode}-INV-YYYY-seq`

### 2. Quotation Revisions

Click **"Revise"** on any quotation to create a new revision:
- Original → marked `SUPERSEDED`
- New revision → `AB-Q-2024-0001-R1`, then `-R2`, etc.

### 3. Partial Invoicing

From the quotation edit page or row actions:
- Click **"Generate Invoice"**
- Enter progress percentage (e.g., 50%)
- Creates a partial invoice tracking `billedToDate` and `projectTotal`

### 4. Supplier Quote Management

- Create supplier quotes linked to customer quotations
- Accept or reject quotes via row actions
- Compare pricing across suppliers

### 5. File Attachments

- Upload receipts and documents to expenses
- Supported formats: images, PDF, Office documents
- Max file size: 10MB

### 6. PDF Export

- Click the **"PDF"** button on any document preview (Quotation, PO, DO, Invoice, Supplier Quote)
- Downloads a formatted A4 PDF

---

## Troubleshooting

### PostgreSQL Connection Issues

```
Error: P1001: Can't reach database server at `localhost:5432`
```

- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check your `DATABASE_URL` in `.env`
- For cloud, ensure SSL mode is set: `?sslmode=require`

### Port 3000 Already in Use

```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 yarn dev
```

### Build Errors

```bash
# Clear Next.js cache and rebuild
rm -rf .next
yarn build
```

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database completely
npx prisma migrate reset
```

### File Upload Issues

- Ensure `public/uploads/` directory exists
- Check file is under 10MB
- Supported formats: images, PDF, DOC, DOCX, XLS, XLSX

---

## Architecture Decisions

1. **Next.js App Router** — File-based routing with automatic code splitting per page
2. **Route Groups** — `(authenticated)/` group applies sidebar layout and auth guard to all protected pages
3. **Domain Modules** — Each business domain (quotations, invoices, etc.) has its own module with components, hooks, services, and validations
4. **PostgreSQL + Prisma** — Relational integrity for ERP data, type-safe queries, automatic migrations
5. **API Routes** — Single deployment, shared types between frontend and backend, no CORS issues
6. **html2canvas + jsPDF** — Client-side PDF generation from live document previews
7. **Local File Storage** — Simple file upload for development; swap to S3/cloud storage for production
