# NexusERP — Business Management Suite

A modern, full-stack ERP system built for small and medium enterprises. Manages the complete business lifecycle: sales quotations, procurement, delivery, invoicing, expense tracking, and profitability analysis.

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Framework | Next.js 14 (App Router)           |
| Frontend  | React 18, Tailwind CSS, shadcn/ui |
| Backend   | Next.js API Routes (REST)         |
| Database  | PostgreSQL 14+ (Prisma ORM)       |
| Charts    | Recharts                          |
| PDF       | html2canvas + jsPDF               |
| Icons     | Lucide React                      |

## Architecture

```
┌──────────────────────────────────────────────────┐
│  Browser (React SPA)                             │
│  ┌──────────────────────────────────────────────┐│
│  │  shadcn/ui Components + Tailwind CSS         ││
│  │  Recharts Dashboards + Data Tables           ││
│  └──────────┬───────────────────────────────────┘│
│             │ fetch() / useApi hook               │
│  ┌──────────▼───────────────────────────────────┐│
│  │  Next.js API Routes (/api/*)                 ││
│  │  ┌─────────────────────────────────────────┐ ││
│  │  │  lib/prisma.ts  — Prisma client         │ ││
│  │  │  lib/api-helpers.ts — Response helpers   │ ││
│  │  └─────────────┬───────────────────────────┘ ││
│  └────────────────┼─────────────────────────────┘│
│                   │                               │
│  ┌────────────────▼─────────────────────────────┐│
│  │  PostgreSQL (nexus_erp database)             ││
│  │  Tables: companies, users, customers,        ││
│  │  suppliers, quotations, supplier_quotes,     ││
│  │  purchase_orders, delivery_orders, invoices, ││
│  │  expenses, audit_logs, settings              ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **Yarn** (or npm)
- **PostgreSQL** 14+ (local or cloud — [Neon](https://neon.tech) / [Supabase](https://supabase.com) free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/kavin680/-NexusERP.git
cd -NexusERP
yarn install        # or: npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection string:

```env
# Local PostgreSQL:
DATABASE_URL="postgresql://nexus:nexus123@localhost:5432/nexus_erp"

# Cloud (Neon / Supabase) — add ?sslmode=require:
# DATABASE_URL="postgresql://user:password@host:5432/nexus_erp?sslmode=require"
```

### 3. Set Up Database

```bash
# Run Prisma migrations (creates tables)
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 4. Start Development Server

```bash
yarn dev            # or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app hot-reloads on file changes.

### 5. Seed Demo Data

On first load, the app auto-seeds demo data. To manually control:

```bash
# Seed demo data (idempotent — skips if data exists)
curl -X POST http://localhost:3000/api/seed

# Reset everything and re-seed
curl -X POST "http://localhost:3000/api/seed?reset=1"
```

The seeder creates:
- **4 companies** (Al Bashir Trading, JV Projects, Kuwait Branch, Lanka)
- **8 users** across all roles
- **7 customers** and **7 suppliers**
- **9 quotations** with line items (AED and LKR currencies)
- **7 supplier quotes**, **6 purchase orders**, **5 delivery orders**
- **7 invoices** (PAID, UNPAID, PARTIAL, OVERDUE, VOID statuses)
- **12 expenses** across all categories
- **11 audit log entries**

---

## Demo Login

All demo users share password: **`password123`**

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

Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/). During install, set a password and create the `nexus_erp` database via pgAdmin.

### Cloud (Free Tier)

1. Go to [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a free project
3. Copy the connection string and add to `.env`

---

## ERP Modules

| Module              | Description                                              | Create/Edit | Preview | Export | Email |
|---------------------|----------------------------------------------------------|:-----------:|:-------:|:------:|:-----:|
| **Dashboard**       | KPIs, charts, activity feed, business overview           |     —       |    —    |   —    |   —   |
| **Companies**       | Multi-company management with logos and bank details     |     Yes     |    —    |   —    |   —   |
| **Users & Roles**   | RBAC with 6 roles, per-company user assignment           |     Yes     |    —    |   —    |   —   |
| **Customers**       | Customer master data with single address field           |     Yes     |    —    |   —    |   —   |
| **Suppliers**       | Supplier registry with bank and tax details              |     Yes     |    —    |   —    |   —   |
| **Quotations**      | Sales quotes with line items, revisions, approve/reject  |     Yes     |   Yes   |  Yes   |  Yes  |
| **Supplier Quotes** | Supplier bid management with supplier selector           |     Yes     |   Yes   |  Yes   |   —   |
| **Purchase Orders** | PO lifecycle with quotation + supplier selectors         |     Yes     |   Yes   |  Yes   |   —   |
| **Delivery Orders** | Outbound delivery tracking, generate invoice from DO     |     Yes     |   Yes   |  Yes   |   —   |
| **Invoices**        | Progressive billing, payment history, aging              |     Yes     |   Yes   |  Yes   |  Yes  |
| **Expenses**        | Categorized tracking with project + supplier selectors   |     Yes     |    —    |  Yes   |   —   |
| **Profitability**   | Project P&L, revenue vs expenses charts                  |     —       |    —    |   —    |   —   |
| **Audit Logs**      | Complete audit trail of all system actions                |     —       |    —    |   —    |   —   |
| **Reports**         | Sales, expense, aging, and supplier reports               |     —       |    —    |   —    |   —   |
| **Settings**        | Currency, tax, prefixes, SMTP, auto-numbering config     |     Yes     |    —    |   —    |   —   |

### Key Workflows

1. **Quotation → PO → DO → Invoice**
   - Create a quotation for a customer
   - When approved, generate a PO to your supplier (row action or edit page button)
   - Generate a DO for outbound delivery
   - Create an invoice (supports partial/progress billing)

2. **Quotation Revisions**
   - Click "Revise" on an existing quotation
   - Creates a new revision (R1, R2, ...) — original is marked SUPERSEDED

3. **Company-Based Numbering**
   - Documents are numbered as `{CompanyCode}-Q/PO/DO/INV/SQ-YYYY-seq`
   - Each company has its own sequence counter

4. **File Attachments**
   - Upload receipts/documents to expenses
   - Files stored in `public/uploads/` (10MB limit)

5. **PDF / HTML Export**
   - Click "Export PDF" from the row actions menu on any document
   - Opens a printable HTML page with company header, line items, and totals
   - Use browser Print → Save as PDF for A4 PDF output

6. **Email Documents**
   - Click "Send Email" from quotation or invoice row actions
   - Enter recipient email, name, subject, and optional message
   - Requires SMTP configuration in Settings

7. **Payment Recording**
   - Open an existing invoice for editing
   - Use the Payment History card to add individual payments (amount, method, reference)
   - Paid total auto-recalculates from recorded payments

8. **Approve / Reject Quotations**
   - Open an existing quotation for editing
   - Click Approve or Reject buttons to change quotation status

---

## API Documentation

All API endpoints return JSON and follow RESTful conventions. Base URL: `/api`.

### Authentication

```
POST /api/auth          # Login (email + password)
```

### Core Resources

All resource endpoints support standard CRUD operations:

```
GET    /api/{resource}           # List (paginated)
POST   /api/{resource}           # Create
GET    /api/{resource}/:id       # Get by ID
PUT    /api/{resource}/:id       # Update
DELETE /api/{resource}/:id       # Delete
```

**Resources:** `companies`, `users`, `customers`, `suppliers`, `quotations`, `supplier-quotes`, `purchase-orders`, `delivery-orders`, `invoices`, `expenses`

### Special Endpoints

```
GET  /api/dashboard              # Aggregated KPIs and charts
GET  /api/reports?type=X         # Generate report
GET  /api/audit-logs             # Audit trail (read-only)
GET  /api/settings               # App settings
PUT  /api/settings               # Update settings
POST /api/seed                   # Seed demo data
POST /api/seed?reset=1           # Reset and re-seed
POST /api/upload                 # Upload file (multipart/form-data)
GET  /api/export/:type/:id       # Export document as printable HTML
POST /api/email                  # Send document via email
```

### Report Types

| Type                   | Description                                    |
|------------------------|------------------------------------------------|
| `profit-loss`          | P&L summary (revenue, expenses, net profit)    |
| `receivables`          | Outstanding customer invoices                  |
| `payables`             | Outstanding supplier payments                  |
| `expense-breakdown`    | Expenses grouped by category                   |
| `revenue-by-month`     | Monthly revenue breakdown                      |

### Common Query Parameters

All list endpoints support:

| Parameter | Type   | Default | Description                    |
|-----------|--------|---------|--------------------------------|
| q         | string | —       | Full-text search               |
| page      | number | 1       | Page number                    |
| limit     | number | 50      | Items per page (max 100)       |

Response envelope:

```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "limit": 50,
  "pages": 1
}
```

### Document Statuses

| Document        | Statuses                                          |
|-----------------|---------------------------------------------------|
| Quotation       | `DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `SUPERSEDED` |
| Supplier Quote  | `PENDING`, `ACCEPTED`, `REJECTED`                 |
| Purchase Order  | `DRAFT`, `SENT`, `RECEIVED`, `CANCELLED`          |
| Delivery Order  | `PENDING`, `DISPATCHED`, `PARTIAL`, `DELIVERED`   |
| Invoice         | `PAID`, `UNPAID`, `PARTIAL`, `OVERDUE`, `VOID`    |

### User Roles & RBAC

Roles are enforced at both API middleware (403 on unauthorized requests) and UI level (sidebar items filtered by role).

| Role          | Accessible Modules                                            |
|---------------|---------------------------------------------------------------|
| SUPER_ADMIN   | Full access to everything                                     |
| ADMIN         | Full access to everything                                     |
| SALES         | Dashboard, Quotations, Customers, Delivery Orders, Invoices   |
| PROCUREMENT   | Dashboard, Suppliers, Purchase Orders, Supplier Quotes         |
| ACCOUNTANT    | Dashboard, Invoices, Expenses, Reports, Profitability          |
| VIEWER        | Read-only access to all modules (sidebar shows all items)     |

---

## Project Structure

```
-NexusERP/
├── app/
│   ├── layout.tsx                  # Root layout (global styles, toaster)
│   ├── page.tsx                    # Root redirect → /dashboard
│   ├── login/page.tsx              # Public login page
│   ├── (authenticated)/            # Route group with auth guard
│   │   ├── layout.tsx              # Sidebar + Topbar shell
│   │   ├── dashboard/page.tsx
│   │   ├── quotations/
│   │   │   ├── page.tsx            # List view
│   │   │   ├── new/page.tsx        # Create form
│   │   │   └── [id]/edit/page.tsx  # Edit form
│   │   ├── purchase-orders/        # Same pattern
│   │   ├── delivery-orders/
│   │   ├── invoices/
│   │   ├── supplier-quotes/
│   │   ├── companies/
│   │   ├── customers/
│   │   ├── suppliers/
│   │   ├── expenses/
│   │   ├── profitability/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── users/
│   │   └── audit/
│   └── api/                        # REST API routes
│       ├── auth/route.ts
│       ├── companies/
│       │   ├── route.ts            # GET (list) + POST (create)
│       │   └── [id]/route.ts       # GET + PUT + DELETE
│       ├── quotations/             # Same pattern for all resources
│       ├── supplier-quotes/
│       ├── purchase-orders/
│       ├── delivery-orders/
│       ├── invoices/
│       ├── customers/
│       ├── suppliers/
│       ├── expenses/
│       ├── users/
│       ├── audit-logs/
│       ├── dashboard/
│       ├── reports/
│       ├── settings/
│       ├── seed/
│       ├── upload/                 # File upload endpoint
│       └── [[...path]]/            # Health check + fallback
│
├── modules/                        # Domain-based modules
│   ├── dashboard/
│   │   ├── components/             # DashboardView
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── validations/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── quotations/                 # QuotationsView, QuotationForm
│   ├── purchase-orders/            # PurchaseOrdersView, PurchaseOrderForm
│   ├── delivery-orders/            # DeliveryOrdersView, DeliveryOrderForm
│   ├── invoices/                   # InvoicesView, InvoiceForm
│   ├── supplier-quotes/            # SupplierQuotesView, SupplierQuoteForm
│   ├── companies/                  # CompaniesView, CompanyForm
│   ├── customers/                  # CustomersView, CustomerForm
│   ├── suppliers/                  # SuppliersView, SupplierForm
│   ├── expenses/                   # ExpensesView, ExpenseForm
│   ├── profitability/              # ProfitabilityView
│   ├── reports/                    # ReportsView
│   ├── settings/                   # SettingsView
│   ├── users/                      # UsersView
│   └── audit/                      # AuditView
│
├── components/
│   ├── layout/                     # LoginScreen, Sidebar, Topbar
│   ├── shared/                     # DocumentPreview, FileUpload, FilterBar,
│   │                               # KpiCard, PageHeader, Pagination,
│   │                               # RowActions, StatusPill, CustomerSelector,
│   │                               # SupplierSelector, QuotationSelector,
│   │                               # ProjectSelector, SendEmailDialog
│   └── ui/                         # ~40 shadcn/ui primitives
│
├── hooks/                          # use-api, use-mobile, use-toast
├── lib/                            # Prisma client, auth, API helpers,
│   │                               # validations/, constants, permissions
│   └── validations/                # Zod schemas per domain
├── types/                          # TypeScript types per domain + barrel
├── prisma/                         # Schema + migrations
├── docs/                           # API, Architecture, Changelog docs
├── public/uploads/                 # Uploaded files (gitignored)
├── tests/                          # unit/, integration/, e2e/
├── .github/workflows/              # CI: lint, test, deploy
└── config files                    # package.json, tsconfig, tailwind, etc.
```

---

## Development Commands

```bash
# Start development server (hot reload)
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Lint
yarn lint

# Database
npx prisma migrate dev        # Run migrations
npx prisma generate           # Generate Prisma client
npx prisma studio             # Open visual database editor
npx prisma migrate reset      # Reset database completely
npx prisma migrate status     # Check migration status

# Seed
curl -X POST http://localhost:3000/api/seed           # Seed demo data
curl -X POST "http://localhost:3000/api/seed?reset=1"  # Reset and re-seed
```

---

## Environment Variables

| Variable       | Example                                              | Description                |
|----------------|------------------------------------------------------|----------------------------|
| `DATABASE_URL` | `postgresql://nexus:nexus123@localhost:5432/nexus_erp` | PostgreSQL connection string |
| `NODE_ENV`     | `development`                                        | Environment                |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add `DATABASE_URL` environment variable (use Neon/Supabase for cloud PostgreSQL)
4. Deploy

### Docker

```bash
# Build
docker build -t nexuserp .

# Run (set DATABASE_URL to your cloud/remote PostgreSQL)
docker run -p 3000:3000 -e DATABASE_URL="postgresql://..." nexuserp
```

### Manual

```bash
yarn install
npx prisma migrate deploy
yarn build
yarn start
```

---

## Troubleshooting

### PostgreSQL Connection Error

```
Error: P1001: Can't reach database server at `localhost:5432`
```

- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify `DATABASE_URL` in `.env`
- For cloud: ensure `?sslmode=require` is appended

### Port 3000 In Use

```bash
lsof -ti:3000 | xargs kill -9
# Or use a different port:
PORT=3001 yarn dev
```

### Build Errors

```bash
rm -rf .next
yarn build
```

### Prisma Issues

```bash
npx prisma generate         # Regenerate client
npx prisma migrate reset    # Full database reset
```

### File Upload Issues

- Max file size: 10MB
- Uploads stored in `public/uploads/`
- Ensure the directory exists and is writable

---

## Database Tables

| Table             | Key Fields                                          |
|-------------------|-----------------------------------------------------|
| companies         | `code` (unique), name, currency, bank               |
| users             | `email` (unique), name, role, company, password     |
| customers         | `code` (unique), company, contact, billing/shipping |
| suppliers         | `code` (unique), company, contact, bank             |
| quotations        | `number` (unique), customer, items, total, poDocument |
| supplier_quotes   | `number` (unique), supplier, items, amount          |
| purchase_orders   | `number` (unique), supplier, items, amount          |
| delivery_orders   | `number` (unique), customer, lineItems              |
| invoices          | `number` (unique), customer, total, paid, payments  |
| expenses          | `number` (unique), category, amount, attachment     |
| audit_logs        | user, module, action, target, time                  |
| settings          | `type` (unique), prefixes, SMTP, tax config         |

---

## License

Private — All rights reserved.
