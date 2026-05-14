# NexusERP Architecture

## Overview

NexusERP is a full-stack ERP application built with **Next.js 14** (App Router), **React 18**, **Prisma ORM**, and **PostgreSQL**. It follows an API-first architecture where all frontend components consume backend REST endpoints.

## Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Framework   | Next.js 14 (App Router)                   |
| Frontend    | React 18, Tailwind CSS, shadcn/ui, Recharts |
| Backend     | Next.js API Routes (Route Handlers)       |
| Database    | PostgreSQL                                |
| ORM         | Prisma 5                                  |
| Validation  | Zod                                       |
| Language    | TypeScript 5                              |
| Package Mgr | Yarn 1.22+                                |

## Directory Structure

```
├── app/
│   ├── api/                    # REST API route handlers
│   │   ├── auth/route.ts       # POST /api/auth (login)
│   │   ├── companies/          # CRUD /api/companies
│   │   ├── users/              # CRUD /api/users
│   │   ├── customers/          # CRUD /api/customers
│   │   ├── suppliers/          # CRUD /api/suppliers
│   │   ├── quotations/         # CRUD /api/quotations (with revision)
│   │   ├── supplier-quotes/    # CRUD /api/supplier-quotes
│   │   ├── purchase-orders/    # CRUD /api/purchase-orders
│   │   ├── delivery-orders/    # CRUD /api/delivery-orders
│   │   ├── invoices/           # CRUD /api/invoices (auto-status)
│   │   ├── expenses/           # CRUD /api/expenses
│   │   ├── audit-logs/         # GET /api/audit-logs
│   │   ├── dashboard/          # GET /api/dashboard (aggregated KPIs)
│   │   ├── reports/            # GET /api/reports (date-filtered)
│   │   ├── settings/           # GET/PUT /api/settings
│   │   ├── export/[type]/[id]/ # GET — printable HTML export
│   │   ├── email/              # POST — send document via email
│   │   └── seed/               # POST /api/seed (demo data)
│   ├── layout.tsx              # Root layout with Toaster
│   └── page.tsx                # Main SPA entry point
├── components/
│   ├── shared/                 # Reusable UI components
│   │   ├── FilterBar.tsx       # Search bar with API-connected filtering
│   │   ├── KpiCard.tsx         # Dashboard KPI card
│   │   ├── PageHeader.tsx      # Page title component
│   │   ├── RowActions.tsx      # Dropdown actions (View/Edit/Delete/Duplicate)
│   │   ├── StatusPill.tsx      # Status badge component
│   │   ├── CustomerSelector.tsx    # Searchable customer dropdown
│   │   ├── SupplierSelector.tsx    # Searchable supplier dropdown
│   │   ├── QuotationSelector.tsx   # Searchable quotation dropdown
│   │   ├── ProjectSelector.tsx     # Project selector from quotations
│   │   └── SendEmailDialog.tsx     # Email composition dialog
│   ├── ui/                     # shadcn/ui primitives
│   └── views/                  # Page-level view components
│       ├── DashboardView.tsx   # Main dashboard with charts
│       ├── QuotationsView.tsx  # Quotation listing
│       ├── InvoicesView.tsx    # Invoice listing
│       ├── NewQuotationDialog.tsx # Full quotation creation form
│       ├── SettingsView.tsx    # Company settings (API-wired)
│       └── ...                 # Other module views
├── hooks/
│   └── use-api.ts              # Data fetching hook + apiMutate utility
├── lib/
│   ├── api-helpers.ts          # Server-side utilities (pagination, audit, doc numbering)
│   ├── constants.ts            # Shared constants (roles, colors)
│   ├── prisma.ts               # Prisma client singleton
│   ├── utils.ts                # Client-side utilities (fmtMoney, initials)
│   └── validations.ts         # Zod schemas for all API inputs
├── prisma/
│   └── schema.prisma           # Database schema (12 models)
├── types/
│   └── index.ts                # Shared TypeScript interfaces
└── docs/
    ├── API.md                  # API endpoint documentation
    ├── ARCHITECTURE.md         # This file
    ├── DEPLOYMENT.md           # Deployment guide
    ├── SETUP.md                # Development setup guide
    └── CHANGELOG.md            # Version changelog
```

## Data Flow

```
Browser  →  React Components  →  useApi() / apiMutate()
                                       ↓
                              Next.js API Routes
                                       ↓
                              Zod Validation
                                       ↓
                              Prisma ORM  →  PostgreSQL
                                       ↓
                              Audit Log (auto-created)
```

1. **Frontend**: React components call `useApi(url)` for GET requests and `apiMutate(url, method, body)` for mutations.
2. **API Routes**: Each route validates input with Zod schemas, performs the database operation via Prisma, and creates an audit log entry.
3. **Response**: Standardized JSON responses via `jsonResponse()` / `errorResponse()` helpers.

## Database Models

| Model          | Table              | Key Fields                                         |
|----------------|--------------------|-----------------------------------------------------|
| Company        | companies          | code (unique), name, currency, active               |
| User           | users              | email (unique), role, company, status                |
| Customer       | customers          | code (unique), company, contact, credit, terms       |
| Supplier       | suppliers          | code (unique), company, contact, bank, terms         |
| Quotation      | quotations         | number (unique), rev, customer, items[], status      |
| SupplierQuote  | supplier_quotes    | number (unique), supplier, linkedQuote, status       |
| PurchaseOrder  | purchase_orders    | number (unique), supplier, linkedQuote, status       |
| DeliveryOrder  | delivery_orders    | number (unique), customer, linkedQuote, status       |
| Invoice        | invoices           | number (unique), customer, total, paid, status       |
| Expense        | expenses           | number (unique), category, supplier, amount          |
| AuditLog       | audit_logs         | user, module, action, target, time                   |
| Setting        | settings           | type (unique), prefixes, tax rate, notifications     |

## Document Numbering

All transactional documents use auto-generated sequential numbers:

```
[PREFIX]-[YEAR]-[SEQUENCE]
Example: AB-QT-2026-0001, AB-INV-2026-0012
```

The `generateDocNumber()` function in `lib/api-helpers.ts` queries the latest document number and increments the sequence.

## RBAC (Role-Based Access Control)

Six roles are defined and **enforced** at both API middleware and UI levels:

| Role          | API Access                                                   | Sidebar Visibility |
|---------------|--------------------------------------------------------------|-------------------|
| SUPER_ADMIN   | Full access to all endpoints                                 | All modules       |
| ADMIN         | Full access to all endpoints                                 | All modules       |
| SALES         | Quotations, Customers, Delivery Orders, Invoices             | Sales modules     |
| PROCUREMENT   | Suppliers, Purchase Orders, Supplier Quotes                  | Procurement modules |
| ACCOUNTANT    | Invoices, Expenses, Reports, Profitability                   | Finance modules   |
| VIEWER        | Read-only (GET only) on all endpoints                        | All modules       |

**Enforcement:**
- `lib/rbac.ts` — Permission matrix mapping roles to allowed modules and actions
- `middleware.ts` — Checks JWT role claim against RBAC permissions; returns 403 for unauthorized requests
- `components/layout/Sidebar.tsx` — Filters nav items based on user role

## Key Design Decisions

1. **Soft deletes**: Companies and users are deactivated (not deleted). Invoices are voided.
2. **Quotation revisions**: Creating a revision marks the original as SUPERSEDED and creates a new document with incremented revision number.
3. **Invoice auto-status**: When payment amounts change, invoice status is automatically computed (PAID/PARTIAL/OVERDUE/UNPAID).
4. **Audit logging**: Every create/update/delete operation generates an audit log entry with user, module, action, and target.
5. **Search**: All list endpoints support `?q=` parameter for full-text search across relevant fields.
6. **Pagination**: All list endpoints support `?page=` and `?limit=` with a default of 50 items per page.
