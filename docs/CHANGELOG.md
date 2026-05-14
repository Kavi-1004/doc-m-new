# Changelog

All notable changes to NexusERP are documented here.

## [1.1.0] - 2026-05-13

### Added
- **Zod validation** on all API endpoints with structured error messages
- **Quotation revision** logic: `PUT /api/quotations/:id` with `_action: "revise"` creates new revision and marks original as SUPERSEDED
- **Invoice auto-status**: payment amount changes automatically compute status (PAID/PARTIAL/OVERDUE/UNPAID/VOID)
- **Reports date filtering**: all report types now support `?from=` and `?to=` date range parameters
- **New report types**: `expense-breakdown` and `revenue-by-month`
- **Settings API**: `GET /api/settings` and `PUT /api/settings` with full CRUD
- **Dashboard API**: now returns `margin`, `expenseBreakdown`, and computed KPIs from real data
- **Search functionality**: all list views now wire FilterBar to `?q=` API parameter
- **Delete functionality**: RowActions wired to actual API DELETE calls with confirmation toasts
- **ARCHITECTURE.md**: comprehensive system architecture documentation
- **DEPLOYMENT.md**: production deployment guide with Docker, Vercel, Railway instructions
- **CHANGELOG.md**: this file

### Changed
- **Dashboard KPIs**: removed hardcoded delta strings ("+12.4% vs last yr", "margin"), now computed from real data
- **NewQuotationDialog**: Save Draft and Create & Send buttons now POST to `/api/quotations` API
- **SettingsView**: Save button now PUTs to `/api/companies/:id` with form state management
- **FilterBar**: search input onChange now triggers parent callback for API re-fetch
- **RowActions**: accepts `onView`, `onEdit`, `onDuplicate`, `onDelete` callbacks
- **Customer/Supplier codes**: now use sequential format via `generateDocNumber()` (CUS-YYYY-NNNN, SUP-YYYY-NNNN)
- **All list views**: added `useState` for search, `useCallback` for delete handlers
- **ExpensesView**: category filter now sends `?category=` to API instead of client-side filtering
- **Invoice DELETE**: now voids (soft-delete via status=VOID) instead of hard-deleting
- **Quotation DELETE**: only allows deletion of DRAFT quotations

### Fixed
- Reports API now excludes VOID invoices from receivables calculations
- Reports API now excludes CANCELLED POs from payables calculations
- Dashboard outstanding calculation now excludes VOID invoices

## [1.0.0] - 2024-03-15

### Added
- Initial release with full ERP functionality
- 12 database models via Prisma ORM
- CRUD API routes for all modules
- Dashboard with charts (Recharts)
- Audit logging on all operations
- Demo seed data via POST /api/seed
- Email-based authentication
- RBAC with 6 roles
