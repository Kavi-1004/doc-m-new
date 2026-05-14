# NexusERP API Reference

Complete REST API documentation for the NexusERP backend.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All endpoints return JSON. Successful responses include the data directly. Error responses follow this format:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (only in 500 errors)"
}
```

## Pagination

All list endpoints support pagination via query parameters:

| Parameter | Type   | Default | Max | Description         |
|-----------|--------|---------|-----|---------------------|
| `page`    | number | 1       | —   | Page number         |
| `limit`   | number | 50      | 100 | Results per page    |

Paginated responses include metadata:

```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "limit": 50,
  "pages": 1
}
```

## Search

Most list endpoints support full-text search via the `q` query parameter. Search is case-insensitive and matches across multiple fields.

```
GET /api/companies?q=alpha
GET /api/quotations?q=mirage&status=APPROVED
```

---

## Endpoints

### Health Check

#### `GET /api/health`

Returns application status and available endpoints.

**Response:**
```json
{
  "ok": true,
  "app": "NexusERP",
  "version": "1.0.0",
  "mode": "full-stack",
  "database": "connected",
  "timestamp": "2026-06-13T10:00:00.000Z",
  "endpoints": ["..."]
}
```

---

### Authentication

#### `POST /api/auth`

Authenticate a user by email. Returns user profile.

**Request Body:**
```json
{
  "email": "aamir@alphabuild.ae"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Aamir Khan",
    "email": "aamir@alphabuild.ae",
    "role": "SUPER_ADMIN",
    "company": "AB"
  }
}
```

**Errors:**
- `400` - Email is required
- `401` - Invalid credentials (user not found or inactive)

---

### Companies

#### `GET /api/companies`

List all companies with optional search and pagination.

**Query Parameters:**
- `q` — Search by name, code, or email
- `page`, `limit` — Pagination

#### `POST /api/companies`

Create a new company.

**Required Fields:** `code`, `name`, `currency`

**Request Body:**
```json
{
  "code": "AB",
  "name": "Alphabuild Contracting LLC",
  "currency": "AED",
  "regNo": "CN-1023455",
  "taxNo": "100123456700003",
  "address": "Dubai, UAE",
  "phone": "+971 4 555 1010",
  "email": "info@alphabuild.ae",
  "bank": "Emirates NBD",
  "active": true
}
```

#### `GET /api/companies/:id`
Get a single company by ID.

#### `PUT /api/companies/:id`
Update a company. Send only fields to update.

#### `DELETE /api/companies/:id`
Soft-delete: sets `active: false`.

---

### Users

#### `GET /api/users`

**Query Parameters:**
- `q` — Search by name or email
- `role` — Filter by role
- `company` — Filter by company code
- `status` — Filter by status (`Active`, `Inactive`)

#### `POST /api/users`

**Required Fields:** `name`, `email`, `role`, `company`

**Valid Roles:** `SUPER_ADMIN`, `ADMIN`, `SALES`, `PROCUREMENT`, `ACCOUNTANT`, `VIEWER`

#### `DELETE /api/users/:id`
Sets `status: "Inactive"` (soft delete).

---

### Customers

#### `GET /api/customers`

**Query Parameters:**
- `q` — Search by company, contact, email, code
- `terms` — Filter by payment terms

#### `POST /api/customers`

Auto-generates `code` in format `CUS-YYYY-NNNN`.

**Required Fields:** `company`, `contact`

---

### Suppliers

#### `GET /api/suppliers`

**Query Parameters:**
- `q` — Search by company, contact, email, code
- `terms` — Filter by payment terms

#### `POST /api/suppliers`

Auto-generates `code` in format `SUP-YYYY-NNNN`.

**Required Fields:** `company`, `contact`

---

### Quotations

#### `GET /api/quotations`

**Query Parameters:**
- `q` — Search by number, customer, project
- `status` — Filter: `DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `SUPERSEDED`
- `customer` — Filter by customer name

#### `POST /api/quotations`

Auto-generates `number` in format `AB-QT-YYYY-NNNN`.

**Required Fields:** `customer`, `project`

**Request Body:**
```json
{
  "customer": "Mirage Hotels Group",
  "project": "Mirage Tower — MEP Fit-out",
  "items": [
    { "d": "Chiller installation", "q": 1, "u": "unit", "r": 480000, "t": 480000 }
  ],
  "terms": "50% advance, 30% on delivery",
  "validity": "2026-07-08"
}
```

#### `PUT /api/quotations/:id` — Create Revision

Send `_action: "revise"` to create a new revision:

```json
{
  "_action": "revise",
  "_user": "Priya Sharma"
}
```

This marks the current quotation as `SUPERSEDED` and creates a new one with incremented `rev` and `R{n}` suffix.

---

### Supplier Quotes

#### `POST /api/supplier-quotes`

**Required Fields:** `supplier`, `linkedQuote`

Links a supplier's bid to a customer quotation for price comparison.

---

### Purchase Orders

#### `POST /api/purchase-orders`

Auto-generates `number` in format `AB-PO-YYYY-NNNN`.

**Required Fields:** `supplier`

**Statuses:** `PENDING` → `IN_TRANSIT` → `DELIVERED` (or `CANCELLED`)

#### `DELETE /api/purchase-orders/:id`
Only deletable when status is `PENDING`.

---

### Delivery Orders

#### `POST /api/delivery-orders`

Auto-generates `number` in format `AB-DO-YYYY-NNNN`.

**Required Fields:** `customer`

**Statuses:** `DISPATCHED`, `PARTIAL`, `DELIVERED`

---

### Invoices

#### `POST /api/invoices`

Auto-generates `number` in format `AB-INV-YYYY-NNNN`.

**Required Fields:** `customer`

#### `PUT /api/invoices/:id` — Payment Status

Payment status is auto-calculated:
- `paid >= total` → `PAID`
- `paid > 0` → `PARTIAL`
- `paid = 0` → `UNPAID`

#### `DELETE /api/invoices/:id`
Voids the invoice (sets `status: "VOID"`). Cannot be undone.

---

### Expenses

#### `POST /api/expenses`

Auto-generates `number` in format `AB-EXP-YYYY-NNNN`.

**Required Fields:** `category`, `amount`

**Valid Categories:** `MATERIAL`, `TRANSPORT`, `LABOR`, `SITE_VISIT`, `ADMIN`, `SUBCONTRACT`

---

### Audit Logs

#### `GET /api/audit-logs`

Read-only. Logs are created automatically.

**Query Parameters:**
- `q` — Search by user, module, action, target
- `module` — Filter by module name
- `user` — Filter by user name
- `action` — Filter by action type
- `from`, `to` — Date range filter

---

### Dashboard

#### `GET /api/dashboard`

Returns aggregated business metrics:

```json
{
  "kpis": {
    "totalRevenue": 1153800,
    "totalExpenses": 363700,
    "totalOutstanding": 697000,
    "activeQuotations": 2,
    "customers": 12,
    "suppliers": 8,
    "margin": 68.5
  },
  "revenueByMonth": [{"m": "Jan", "revenue": 120000, "expenses": 45000}, ...],
  "expenseBreakdown": [{"name": "Materials", "value": 150000, "fill": "#0ea5e9"}, ...],
  "statusBreakdown": {
    "quotations": [{"status": "DRAFT", "count": 3}],
    "invoices": [...],
    "purchaseOrders": [...],
    "deliveryOrders": [...]
  },
  "recentActivity": [...]
}
```

---

### Reports

#### `GET /api/reports`

**Query Parameters:**
- `type` — Report type (default: `summary`)
- `from` — Start date (YYYY-MM-DD)
- `to` — End date (YYYY-MM-DD)

#### `GET /api/reports?type=summary&from=2026-01-01&to=2026-12-31`

**Report Types:**

| Type               | Description                              |
|--------------------|------------------------------------------|
| `summary`          | Overall revenue, expenses, net profit    |
| `profit-loss`      | Revenue vs expenses with net profit      |
| `receivables`      | Outstanding invoices sorted by amount    |
| `payables`         | Pending purchase orders sorted by amount |
| `expense-breakdown`| Expenses grouped by category             |
| `revenue-by-month` | Monthly revenue and expenses trend       |

---

### Settings

#### `GET /api/settings`

Returns app settings (creates defaults if none exist).

#### `PUT /api/settings`

Update app settings. Available fields:

| Field                   | Type    | Default        |
|-------------------------|---------|----------------|
| `defaultCurrency`       | string  | AED            |
| `defaultPaymentTerms`   | string  | Net 30         |
| `taxRate`               | number  | 5              |
| `quotationValidityDays` | number  | 30             |
| `autoNumbering`         | boolean | true           |
| `emailNotifications`    | boolean | true           |
| `dateFormat`            | string  | YYYY-MM-DD     |
| `timezone`              | string  | Asia/Dubai     |

---

### Database Seed

#### `POST /api/seed`

Seeds the database with demo data. Idempotent — skips collections that already have data.

#### `POST /api/seed?reset=1`

Drops all collections and re-seeds with fresh demo data.

---

## Audit Trail

Every create, update, and delete operation automatically creates an audit log entry containing:

- `user` — Who performed the action
- `module` — Which module (Company, User, Quotation, etc.)
- `action` — What was done (CREATED, UPDATED, DELETED, APPROVED, etc.)
- `target` — The affected document (number or code)
- `time` — When it happened
- `ip` — Client IP address

Pass `_user` in the request body to record who performed the action:

```json
{
  "name": "Updated Company Name",
  "_user": "Aamir Khan"
}
```
