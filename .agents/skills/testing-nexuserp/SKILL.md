---
name: testing-nexuserp-e2e
description: Test NexusERP end-to-end — App Router routing, sidebar navigation, auth guard, and domain page rendering. Use when verifying UI or routing changes.
---

## Prerequisites

1. **Database**: PostgreSQL must be running. Run `npx prisma migrate deploy` then `npx prisma generate`.
2. **Dev server**: `yarn dev` (runs on port 3000, hostname 0.0.0.0).
3. **Seed data**: After dev server starts, hit `curl http://localhost:3000/api/seed` to populate demo data.
4. **Demo credentials**: `ahmed@albashir.ae` / `password123`

## Devin Secrets Needed

None — the app uses a local PostgreSQL database with demo credentials hardcoded in the seed endpoint.

## Test Procedure

### 1. Verify Dev Server
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/auth/me` should return 200 or 401
- Check the terminal for compilation errors

### 2. Login Flow
- Navigate to `http://localhost:3000/login`
- Verify login form has Email/Password fields and demo hint text
- Enter demo credentials and click "Sign in"
- Expect redirect to `/dashboard` with "Welcome back!" toast

### 3. Dashboard Rendering
- Verify dashboard shows company name (e.g. "Al Bashir JV Projects")
- Verify KPI cards render (Revenue, Outstanding Invoices, Active Projects, Estimated Profit)
- Verify Revenue vs Expenses chart and Expense Breakdown render
- Verify Recent Quotations table shows data
- **Common issue**: If dashboard crashes with `Cannot read properties of undefined (reading 'name')`, the AppContext provider may not be wrapping children in `app/(authenticated)/layout.tsx`

### 4. Sidebar Navigation
Click each sidebar item and verify:
- URL changes to the correct path
- Page header matches the section name
- Data table or content loads
- Sidebar highlights the active item

Key pages to test:
- Dashboard (`/dashboard`)
- Customers (`/customers`) — expect customer rows with codes like CUST-001
- Quotations (`/quotations`) — expect rows with status pills (APPROVED, SENT, DRAFT, REJECTED)
- Invoices (`/invoices`) — expect rows with statuses (PAID, UNPAID, PARTIAL, OVERDUE, VOID)
- Expenses (`/expenses`) — expect rows with category column
- Settings (`/settings`) — expect company profile form populated with company data from AppContext

### 5. Direct URL Navigation
- Type a URL directly (e.g. `http://localhost:3000/purchase-orders`)
- Verify the page renders correctly without going through sidebar click
- This confirms file-based routing works

### 6. Auth Guard
- Click user avatar menu → Logout
- Navigate directly to `/dashboard`
- Expect redirect to `/login`

### 7. Root Redirect
- Navigate to `/` while authenticated
- Expect redirect to `/dashboard`

## Architecture Notes

- **Route group**: All authenticated pages are under `app/(authenticated)/` with a shared layout
- **AppContext**: `lib/app-context.tsx` provides `company`, `setView`, `updateCompany` to all child view components via React Context
- **View components**: Located in `modules/<domain>/components/` (e.g. `modules/dashboard/components/DashboardView.tsx`)
- **Navigation**: Sidebar uses Next.js `useRouter().push()` for client-side navigation
- **Auth**: JWT-based with cookies, checked in authenticated layout

## Troubleshooting

- **DB migration issues**: If the `password` column is missing from the users table, check `prisma/migrations/*/migration.sql` to ensure it includes `"password" TEXT NOT NULL DEFAULT ''`
- **Lint**: `yarn lint` (uses ESLint ^8.0.0)
- **No test framework**: `yarn test` may fail — no test framework is installed yet. The CI test job failure is pre-existing.
