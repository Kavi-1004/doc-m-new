# Changelog

All notable changes to NexusERP are documented here.

## [1.3.0] - 2026-05-14

### Added — Priority 4 Features
- **App Settings page** (`#15`): Full configuration UI for default currency, payment terms, tax rate, quotation validity days, document prefixes (QT, INV, PO, DO, EXP), auto-numbering toggle, email notifications toggle, and SMTP configuration (host, port, user)
- **Payment recording on invoices** (`#16`): Invoice form now supports adding/deleting individual payment entries with date, amount, method, and reference. Payments stored as JSON array on Invoice model. Paid total auto-recalculates from payment entries
- **Expense-to-project linking** (`#17`): New `ProjectSelector` component extracts unique project names from quotations. Integrated into ExpenseForm replacing the plain text input
- **Supplier selector** (`#18`): New `SupplierSelector` component — searchable dropdown following the CustomerSelector pattern. Integrated into PurchaseOrderForm and SupplierQuoteForm
- **Quotation workflow buttons** (`#19`): Approve and Reject buttons on the QuotationForm (visible when editing). Sets quotation status to APPROVED or REJECTED
- **PDF/HTML export** (`#20`): New `/api/export/[type]/[id]` endpoint generates printable HTML documents for all 6 document types (quotation, invoice, purchase-order, delivery-order, expense, supplier-quote). "Export PDF" row action added to all list views
- **Email sending** (`#21`): New `/api/email` endpoint for sending documents via email. `SendEmailDialog` component with recipient email, name, subject, and message fields. "Send Email" row action on Quotations and Invoices views. Audit log entry created for each send

### Added — New Shared Components
- `components/shared/SupplierSelector.tsx` — Popover + Command searchable supplier dropdown
- `components/shared/ProjectSelector.tsx` — Popover + Command project selector from quotations
- `components/shared/SendEmailDialog.tsx` — Dialog for composing and sending document emails
- `app/api/export/[type]/[id]/route.ts` — HTML document export API
- `app/api/email/route.ts` — Email sending API with audit logging

### Changed
- **CustomerForm**: Single "Address" field replaces separate Billing/Shipping fields (`#7`)
- **CustomersView**: Duplicate handler now copies address consistently
- **Invoice model**: Added `payments Json @default("[]")` field for payment history

## [1.2.0] - 2026-05-14

### Added — Priority 1 & 3 Features
- **Duplicate handlers** (`#4`): `onDuplicate` row actions wired for all 8 modules (Quotations, Customers, Suppliers, SupplierQuotes, PurchaseOrders, DeliveryOrders, Invoices, Expenses)
- **Upload PO for quotation** (`#8`): FileUpload field in QuotationForm for attaching customer PO documents. Added `poDocument` field to Quotation schema
- **Generate DO from PO** (`#9`): "Generate DO" button on PO row actions. Creates delivery order with items mapped from purchase order
- **Generate Invoice from DO** (`#10`): "Generate Invoice" button on DO row actions. Creates invoice from delivery order line items
- **Quotation selector in PO form** (`#11`): New `QuotationSelector` component — searchable dropdown in PurchaseOrderForm that auto-populates items from selected quotation
- **RBAC enforcement** (`#12`): Full permission matrix in `lib/rbac.ts`. API middleware returns 403 for unauthorized requests based on user role
- **Role-based sidebar** (`#14`): Navigation items filtered by user role permissions. VIEWER sees all items read-only; SALES/PROCUREMENT/ACCOUNTANT see only their relevant modules

### Changed
- **Customer form**: Removed Terms & Credit card (`#6`)
- **CustomersView**: Removed Terms and Credit Limit columns

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
