# NexusERP — Development Guide

## Architecture Overview

NexusERP follows a **modular, domain-driven architecture** built on Next.js 14 App Router.

```
NexusERP/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (global styles, toaster)
│   ├── page.tsx                  # Root redirect → /dashboard
│   ├── login/page.tsx            # Public login page
│   ├── (authenticated)/          # Route group with shared auth layout
│   │   ├── layout.tsx            # Sidebar + Topbar shell, auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── quotations/page.tsx
│   │   ├── invoices/page.tsx
│   │   ├── purchase-orders/page.tsx
│   │   ├── delivery-orders/page.tsx
│   │   ├── suppliers/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── companies/page.tsx
│   │   ├── users/page.tsx
│   │   ├── supplier-quotes/page.tsx
│   │   ├── profitability/page.tsx
│   │   └── audit/page.tsx
│   └── api/                      # API routes (unchanged)
│       ├── auth/
│       ├── users/
│       ├── companies/
│       ├── dashboard/
│       ├── quotations/
│       ├── invoices/
│       ├── purchase-orders/
│       ├── delivery-orders/
│       ├── suppliers/
│       ├── customers/
│       ├── expenses/
│       ├── reports/
│       ├── settings/
│       ├── audit-logs/
│       ├── seed/
│       ├── supplier-quotes/
│       └── [[...path]]/
│
├── modules/                      # Domain-based modules
│   ├── dashboard/
│   │   ├── components/           # DashboardView
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── validations/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── quotations/               # QuotationsView, NewQuotationDialog
│   ├── invoices/
│   ├── purchase-orders/
│   ├── delivery-orders/
│   ├── suppliers/
│   ├── customers/
│   ├── expenses/
│   ├── reports/
│   ├── settings/
│   ├── companies/
│   ├── users/
│   ├── supplier-quotes/
│   ├── profitability/
│   └── audit/
│
├── components/                   # Global reusable UI
│   ├── layout/                   # LoginScreen, Sidebar, Topbar
│   ├── shared/                   # FilterBar, KpiCard, PageHeader, RowActions,
│   │                             # StatusPill, CustomerSelector, SupplierSelector,
│   │                             # QuotationSelector, ProjectSelector, SendEmailDialog
│   └── ui/                       # ~40 shadcn/ui primitives
│
├── hooks/                        # Global reusable hooks
│   ├── use-api.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── lib/                          # Core shared infrastructure
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # JWT auth utilities
│   ├── api-client.ts             # HTTP client class
│   ├── api-helpers.ts            # Response helpers, pagination, audit
│   ├── constants.ts              # Nav items, status/role styles
│   ├── permissions.ts            # Role-based permission matrix
│   ├── utils.ts                  # cn(), fmtMoney(), initials()
│   ├── validations.ts            # Re-export barrel (backward compat)
│   ├── validations/              # Domain-specific Zod schemas
│   │   ├── company.ts
│   │   ├── user.ts
│   │   ├── customer.ts
│   │   ├── supplier.ts
│   │   ├── quotation.ts
│   │   ├── purchase-order.ts
│   │   ├── delivery-order.ts
│   │   ├── invoice.ts
│   │   ├── expense.ts
│   │   ├── settings.ts
│   │   └── index.ts
│   ├── services/                 # Business logic services (planned)
│   └── repositories/             # Data access layer (planned)
│
├── types/                        # Shared global types
│   ├── auth.ts                   # Role, User
│   ├── company.ts                # Company
│   ├── customer.ts               # Customer
│   ├── supplier.ts               # Supplier, SupplierQuote
│   ├── quotation.ts              # Quotation, QuotationItem
│   ├── invoice.ts                # PurchaseOrder, DeliveryOrder, Invoice, Expense
│   ├── dashboard.ts              # NavItem, AuditEntry
│   ├── report.ts                 # RevenueSeries, ExpenseBreakdown, StatusCount, ProjectProfitability
│   └── index.ts                  # Barrel re-export
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CHANGELOG.md
│   ├── DEPLOYMENT.md
│   └── SETUP.md
│
├── public/
│
├── .github/
│   └── workflows/
│       ├── lint.yml
│       ├── test.yml
│       └── deploy.yml
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── middleware.ts
└── README.md
```

---

## Development Status

### Completed

| Feature / Area | Status | Notes |
|---|---|---|
| **App Router file-based routing** | Done | 15 routes under `(authenticated)/` group |
| **Login page** | Done | Separate `/login` route with auth redirect |
| **Authenticated layout** | Done | Shared sidebar + topbar shell with auth guard |
| **Domain modules structure** | Done | 15 modules with components/, hooks/, services/, validations/ |
| **View components** | Done | All 16 views migrated to modules |
| **API routes** | Done | 14 resource endpoints + auth + seed + health |
| **Database schema** | Done | Prisma schema with PostgreSQL |
| **Validation schemas** | Done | Zod schemas for all entities, split into modular files |
| **Type definitions** | Done | Domain-specific type files with barrel re-export |
| **Auth system** | Done | JWT-based with cookie + bearer token support |
| **Middleware** | Done | API route protection with JWT verification |
| **Role-based permissions** | Done | Permission matrix enforced at API + UI level |
| **Global UI components** | Done | shadcn/ui + 5 shared components + RowActions with custom actions |
| **CI/CD workflows** | Done | GitHub Actions for lint, test, deploy |
| **Documentation** | Done | API, Architecture, Changelog, Deployment, Setup docs |
| **Document forms (create/edit)** | Done | Quotation, PO, DO, Invoice with live preview & print |
| **Master data forms** | Done | Company, Customer, Supplier, Expense create/edit |
| **Currency selector** | Done | 11 currencies (LKR default) on Quotation form |
| **Company-based doc numbering** | Done | `{CompanyCode}-Q/PO/DO/INV-YYYY-seq` pattern |
| **Quotation revision** | Done | Revise button → R1, R2... suffix, original marked SUPERSEDED |
| **Generate PO from Quotation** | Done | Row action + edit page button, items carried over |
| **Generate DO from Quotation** | Done | Row action + edit page button, items carried over |
| **Partial invoice from Quotation** | Done | Progress % dialog, tracks billedToDate across invoices |
| **Document ID in preview** | Done | Generated ID shown in preview after save (edit page redirect) |

| **Supplier quote management** | Done | Create/edit form, line items, accept/reject, company-based numbering |
| **Profitability reports** | Done | P&L summary, bar chart (revenue vs expenses), pie chart (expense breakdown) |
| **Pagination UI** | Done | Reusable component wired to all 11 list views with page/limit selector |
| **File attachments** | Done | Upload API, FileUpload component, expense receipt upload |
| **PDF export** | Done | html2canvas + jsPDF, Download PDF button on all document previews |
| **Comprehensive seeder** | Done | 4 companies, 8 users, 7 customers, 7 suppliers, 9 quotations, 7 SQs, 6 POs, 5 DOs, 7 invoices, 12 expenses |

### In Progress

| Feature / Area | Status | Notes |
|---|---|---|
| **Module-level hooks** | Scaffolded | Directories created, hooks to be extracted from views |
| **Module-level services** | Scaffolded | Directories created, API call logic to be extracted |
| **Module-level validations** | Scaffolded | Directories created, to mirror lib/validations/ per module |

### Recently Completed

| Feature / Area | Status | Notes |
|---|---|---|
| **RBAC enforcement** | Done | Permission matrix in `lib/rbac.ts`, middleware returns 403 |
| **Role-based sidebar** | Done | Nav items filtered by user role |
| **Duplicate handlers** | Done | `onDuplicate` wired for all 8 modules |
| **Generate DO from PO** | Done | Row action on PO list |
| **Generate Invoice from DO** | Done | Row action on DO list |
| **Quotation selector in PO** | Done | Auto-populates items from selected quotation |
| **Supplier selector** | Done | Integrated into PO and Supplier Quote forms |
| **Project selector** | Done | Integrated into Expense form |
| **Upload PO for quotation** | Done | FileUpload field on quotation form |
| **App Settings page** | Done | Currency, tax, prefixes, SMTP config |
| **Payment recording** | Done | Add/delete payments on invoices |
| **Approve/Reject quotations** | Done | Status workflow buttons |
| **PDF/HTML export** | Done | `/api/export/[type]/[id]` + row actions |
| **Email sending** | Done | `/api/email` + SendEmailDialog component |

### Pending

| Feature / Area | Status | Notes |
|---|---|---|
| **Unit tests** | Not started | Tests for validations, utils, permissions |
| **Integration tests** | Not started | Tests for API routes with test DB |
| **E2E tests** | Not started | Playwright tests for key user flows |
| **lib/services/** | Not started | Extract business logic from API routes |
| **lib/repositories/** | Not started | Extract Prisma queries from API routes |
| **Error boundary** | Not started | Global error handling for pages |
| **Loading states** | Not started | Skeleton loading for each route |
| **Dark mode** | Not started | Theme switching support |
| **i18n** | Not started | Multi-language support |
| **Data export (CSV/Excel)** | Not started | Export to CSV/Excel from list views |

---

## Conventions

### Imports

- Use `@/` path alias for all imports (configured in `tsconfig.json`)
- Import types from `@/types` or `@/types/<domain>` for domain-specific types
- Import validations from `@/lib/validations` or `@/lib/validations/<domain>`
- Import module components from `@/modules/<domain>/components/<Component>`

### File Naming

- Components: `PascalCase.tsx` (e.g., `DashboardView.tsx`)
- Hooks: `use-<name>.ts` (e.g., `use-api.ts`)
- Types: `<domain>.ts` (e.g., `quotation.ts`)
- Validations: `<domain>.ts` (e.g., `quotation.ts`)
- API routes: `route.ts` (Next.js convention)

### Module Structure

Each module under `modules/` follows this structure:

```
modules/<domain>/
├── components/     # React components specific to this domain
├── hooks/          # Custom hooks for this domain
├── services/       # API call functions and business logic
├── validations/    # Zod schemas specific to this domain
├── types.ts        # Re-export types from @/types/<domain>
└── index.ts        # Barrel export for the module
```

### Adding a New Module

1. Create directory under `modules/<name>/`
2. Add subdirectories: `components/`, `hooks/`, `services/`, `validations/`
3. Create `types.ts` and `index.ts`
4. Create page under `app/(authenticated)/<name>/page.tsx`
5. Add API route under `app/api/<name>/route.ts` if needed
6. Add nav item in `lib/constants.ts`
7. Add route mapping in `app/(authenticated)/layout.tsx`
8. Add types in `types/<name>.ts` and re-export in `types/index.ts`
9. Add validation schema in `lib/validations/<name>.ts` and re-export in `lib/validations/index.ts`

---

## Quick Commands

```bash
# Development
yarn dev                    # Start dev server at http://localhost:3000

# Database
npx prisma migrate dev      # Run migrations
npx prisma generate         # Generate Prisma client
npx prisma studio           # Open Prisma Studio GUI

# Build
yarn build                  # Production build

# Seed
curl -X POST http://localhost:3000/api/seed         # Seed demo data
curl -X POST "http://localhost:3000/api/seed?reset=1"  # Reset and re-seed
```
