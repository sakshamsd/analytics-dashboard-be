# CRM Backend – API Documentation

**Base URL:** `http://localhost:4000` (development) or your deployed URL
**API Version:** v1
**API Prefix:** `/api/v1`

---

## Table of Contents

1. [Required Headers](#required-headers)
2. [Response Format](#response-format)
3. [Pagination, Search & Filtering](#pagination-search--filtering)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Companies](#companies)
   - [Contacts](#contacts)
   - [Deals](#deals)
   - [Activities](#activities)
   - [Reports](#reports)
   - [Users](#users)
   - [Dashboard Bootstrap](#dashboard-bootstrap)
6. [Data Models & Field Reference](#data-models--field-reference)
7. [Enum Reference](#enum-reference)

---

## Required Headers

All CRM endpoints (except `/health`) require these headers:

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `x-workspace-id` | UUID string | Yes | Tenant/workspace identifier |
| `x-user-id` | UUID string | Yes | Currently acting user identifier |
| `Content-Type` | string | Yes (on POST/PATCH) | `application/json` |

```
x-workspace-id: 550e8400-e29b-41d4-a716-446655440000
x-user-id: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
Content-Type: application/json
```

---

## Response Format

### Single Resource
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "ownerId": "uuid",
  "owner": { "id": "uuid", "fullName": "Jane Smith" },
  "assignedTo": "uuid",
  "assignedUser": { "id": "uuid", "fullName": "John Doe" },
  "createdBy": "uuid",
  "createdByUser": { "id": "uuid", "fullName": "Jane Smith" },
  "updatedBy": "uuid",
  "updatedByUser": { "id": "uuid", "fullName": "Jane Smith" },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

> **User enrichment:** All CRM responses automatically include resolved user objects alongside the raw UUID fields. Each UUID field (`ownerId`, `assignedTo`, `createdBy`, `updatedBy`) is accompanied by a corresponding object (`owner`, `assignedUser`, `createdByUser`, `updatedByUser`) containing `{ id, fullName }`. This allows frontend tables to display names directly without additional lookups.

### Paginated List
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

---

## Pagination, Search & Filtering

All list endpoints support the following query parameters:

### Common Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 10 | Records per page (max: 100) |
| `search` | string | – | Text search across key fields |
| `sortBy` | string | `createdAt` | Field to sort by (see per-entity allowed fields) |
| `sortOrder` | `ASC` \| `DESC` | `DESC` | Sort direction |

### Entity-Specific Filter Parameters

**Companies:** `status`, `industry`, `ownerId`
**Contacts:** `status`, `companyId`, `assignedTo`, `ownerId`, `doNotContact`
**Deals:** `status`, `stage`, `priority`, `companyId`, `contactId`, `assignedTo`, `ownerId`
**Activities:** `type`, `status`, `priority`, `contactId`, `dealId`, `companyId`, `assignedTo`, `ownerId`
**Users:** no additional filters (search by `fullName` or `email` via `search` param)

**Multi-value filters:** Pass comma-separated values to filter by multiple values:
```
GET /api/v1/deals?status=OPEN&stage=proposal,negotiation
GET /api/v1/contacts?status=active,inactive
```

---

## Error Handling

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Validation error or bad request |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Endpoints

---

### Health Check

#### `GET /health`
Returns API health status. Does **not** require workspace headers.

**Response:**
```json
{ "status": "ok", "timestamp": "2024-01-15T10:30:00.000Z" }
```

---

### Companies

Base path: `/api/v1/companies`

#### `GET /api/v1/companies`
List all companies in workspace with pagination, search, and filtering.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `search` | string | Search name, email, phone, city |
| `status` | string | Filter: `prospect`, `active`, `churned`, `inactive` (comma-separated) |
| `industry` | string | Filter by industry enum value(s) |
| `ownerId` | UUID | Filter by owner user ID |
| `sortBy` | string | `createdAt`, `name`, `status`, `industry`, `annualRevenue`, `updatedAt` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Company objects.

---

#### `POST /api/v1/companies`
Create a new company.

**Request Body** (required fields first):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Company name |
| `email` | string (email) | Yes | Company email address |
| `phone` | string | Yes | Phone number (max 30 chars) |
| `website` | string (URL) | Yes | Company website URL |
| `industry` | enum | Yes | See [Industry enum](#industry) |
| `country` | string | Yes | Country name |
| `state` | string | Yes | State/Province |
| `city` | string | Yes | City |
| `address` | string | Yes | Street address |
| `postalCode` | string | Yes | Postal code (max 20 chars) |
| `leadSource` | enum | Yes | See [LeadSource enum](#leadsource) |
| `status` | enum | No | Default: `prospect`. See [CompanyStatus enum](#companystatus) |
| `companySize` | enum | No | See [CompanySize enum](#companysize) |
| `numberOfEmployees` | integer | No | Actual employee headcount |
| `annualRevenue` | integer | No | Annual revenue in cents |
| `linkedinUrl` | string (URL) | No | LinkedIn company page URL |
| `timezone` | string | No | IANA timezone (e.g. `Australia/Sydney`) |
| `description` | string | No | Free-text description |
| `ownerId` | UUID | No | Assign an owner user ID |

**Response:** `201 Created` – the created Company object.

---

#### `GET /api/v1/companies/:id`
Get a single company by ID.

**Response:** Company object.

---

#### `PATCH /api/v1/companies/:id`
Update a company (partial update – only send fields to change).

**Request Body:** Same fields as `POST`, all optional.

**Response:** Updated Company object.

---

#### `DELETE /api/v1/companies/:id`
Soft delete a company.

**Response:** `204 No Content`

---

#### `PATCH /api/v1/companies/:id/restore`
Restore a soft-deleted company.

**Response:** Restored Company object.

---

#### `POST /api/v1/companies/bulk-delete`
Soft delete multiple companies.

**Request Body:**
```json
{ "ids": ["uuid1", "uuid2", "uuid3"] }
```

**Response:**
```json
{ "deleted": 3 }
```

---

#### `GET /api/v1/companies/:id/contacts`
Get all contacts belonging to a company (paginated).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `search` | string | Search name, email, mobile, jobTitle |
| `sortBy` | string | `createdAt`, `name`, `email`, `status`, `lastActivityAt` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Contact objects.

---

#### `GET /api/v1/companies/:id/deals`
Get all deals belonging to a company (paginated).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `search` | string | Search deal title |
| `sortBy` | string | `createdAt`, `dealValue`, `title`, `stage`, `status`, `priority`, `expectedCloseDate` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Deal objects.

---

### Contacts

Base path: `/api/v1/contacts`

#### `GET /api/v1/contacts`
List all contacts in workspace.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `search` | string | Search name, email, mobile, jobTitle |
| `status` | string | Filter: `active`, `inactive`, `bounced`, `unsubscribed` |
| `companyId` | UUID | Filter contacts by company |
| `assignedTo` | UUID | Filter by assigned user |
| `ownerId` | UUID | Filter by owner |
| `doNotContact` | boolean | `true` or `false` |
| `sortBy` | string | `createdAt`, `name`, `email`, `status`, `lastActivityAt` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Contact objects (includes nested `company` object).

---

#### `POST /api/v1/contacts`
Create a new contact.

**Request Body** (required fields first):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name |
| `email` | string (email) | Yes | Email address |
| `companyId` | UUID | Yes | Company this contact belongs to |
| `assignedTo` | UUID | Yes | User ID this contact is assigned to |
| `phone` | string | No | Office/work phone (max 30 chars) |
| `mobile` | string | No | Mobile number (max 30 chars) |
| `jobTitle` | string | No | Job title |
| `department` | string | No | Department within company (max 120 chars) |
| `linkedinUrl` | string (URL) | No | LinkedIn profile URL |
| `status` | enum | No | Default: `active`. See [ContactStatus enum](#contactstatus) |
| `leadSource` | enum | No | How this contact was acquired. See [LeadSource enum](#leadsource) |
| `preferredContactMethod` | enum | No | `email`, `phone`, or `mobile` |
| `isPrimary` | boolean | No | Is primary contact for company. Default: `false` |
| `doNotContact` | boolean | No | DNC flag. Default: `false` |

**Response:** `201 Created` – the created Contact object.

---

#### `GET /api/v1/contacts/:id`
Get a single contact (includes nested `company`).

---

#### `PATCH /api/v1/contacts/:id`
Update a contact (partial). Same fields as POST, all optional.

---

#### `DELETE /api/v1/contacts/:id`
Soft delete a contact. **Response:** `204 No Content`

---

#### `PATCH /api/v1/contacts/:id/restore`
Restore a soft-deleted contact.

---

#### `POST /api/v1/contacts/bulk-delete`
```json
{ "ids": ["uuid1", "uuid2"] }
```
**Response:** `{ "deleted": 2 }`

---

#### `GET /api/v1/contacts/:id/deals`
Get all deals associated with a contact (paginated).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `search` | string | Search deal title |
| `sortBy` | string | `createdAt`, `dealValue`, `title`, `stage`, `status`, `priority`, `expectedCloseDate` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Deal objects.

---

#### `GET /api/v1/contacts/:id/activities`
Get all activities associated with a contact (paginated).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `search` | string | Search activity subject |
| `sortBy` | string | `createdAt`, `dueDate`, `subject`, `status`, `priority`, `type` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Activity objects.

---

### Deals

Base path: `/api/v1/deals`

#### `GET /api/v1/deals`
List all deals in workspace.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `search` | string | Search deal title or company name |
| `status` | string | `OPEN`, `WON`, `LOST` (comma-separated) |
| `stage` | string | Deal stage(s), comma-separated |
| `priority` | string | Priority level(s), comma-separated |
| `companyId` | UUID | Filter by company |
| `contactId` | UUID | Filter by contact |
| `assignedTo` | UUID | Filter by assigned user |
| `ownerId` | UUID | Filter by owner |
| `sortBy` | string | `createdAt`, `dealValue`, `title`, `stage`, `status`, `priority`, `expectedCloseDate` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Deal objects (includes nested `company` and `contact`).

---

#### `POST /api/v1/deals`
Create a new deal.

**Request Body** (required fields first):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Deal title (max 200 chars) |
| `dealValue` | integer | Yes | Deal value in smallest currency unit (e.g. cents). Must be >= 0 |
| `stage` | enum | Yes | See [DealStage enum](#dealstage) |
| `priority` | enum | Yes | See [DealPriority enum](#dealpriority) |
| `companyId` | UUID | Yes | Company associated with the deal |
| `assignedTo` | UUID | Yes | User this deal is assigned to |
| `currency` | string | No | 3-letter ISO currency code. Default: `AUD` |
| `status` | enum | No | Default: `OPEN`. See [DealStatus enum](#dealstatus) |
| `contactId` | UUID | No | Contact associated (must belong to `companyId`) |
| `probability` | integer | No | Win probability 0-100 |
| `expectedCloseDate` | date (YYYY-MM-DD) | No | Expected close date |
| `actualCloseDate` | date (YYYY-MM-DD) | No | Actual close date |
| `lostReason` | enum | No* | **Required when `status` is `LOST`**. See [DealLostReason enum](#deallostreason) |
| `source` | enum | No | How deal originated. See [LeadSource enum](#leadsource) |
| `description` | string | No | Free-text notes |

**Response:** `201 Created` – the created Deal object.

---

#### `GET /api/v1/deals/:id`
Get a single deal (includes nested `company` and `contact`).

---

#### `PATCH /api/v1/deals/:id`
Update a deal. `contactId` can be set to `null` to disassociate.

---

#### `DELETE /api/v1/deals/:id`
Soft delete a deal. **Response:** `204 No Content`

---

#### `PATCH /api/v1/deals/:id/restore`
Restore a soft-deleted deal.

---

#### `POST /api/v1/deals/bulk-delete`
```json
{ "ids": ["uuid1", "uuid2"] }
```

---

#### `GET /api/v1/deals/:id/activities`
Get all activities linked to a deal (paginated).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `search` | string | Search activity subject |
| `sortBy` | string | `createdAt`, `dueDate`, `subject`, `status`, `priority`, `type` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Activity objects.

---

### Activities

Base path: `/api/v1/activities`

#### `GET /api/v1/activities`
List all activities in workspace.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `search` | string | Search subject |
| `type` | string | Activity type(s), comma-separated |
| `status` | string | `OPEN` or `DONE` |
| `priority` | string | `low`, `medium`, `high` |
| `contactId` | UUID | Filter by contact |
| `dealId` | UUID | Filter by deal |
| `companyId` | UUID | Filter by company |
| `assignedTo` | UUID | Filter by assigned user |
| `ownerId` | UUID | Filter by owner |
| `sortBy` | string | `createdAt`, `dueDate`, `subject`, `status`, `priority`, `type` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Activity objects (includes nested `contact`, `deal`, `company`).

---

#### `POST /api/v1/activities`
Create a new activity.

**Request Body** (required fields first):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | Yes | See [ActivityType enum](#activitytype) |
| `subject` | string | Yes | Activity subject/title (max 200 chars) |
| `priority` | enum | Yes | See [ActivityPriority enum](#activitypriority) |
| `dueDate` | string (YYYY-MM-DD) | Yes | Due date |
| `dueTime` | string (HH:MM) | Yes | Due time in HH:MM or HH:MM:SS |
| `contactId` | UUID | Yes | Contact this activity is linked to |
| `assignedTo` | UUID | Yes | User this activity is assigned to |
| `body` | string | No | Activity notes/body |
| `status` | enum | No | Default: `OPEN`. See [ActivityStatus enum](#activitystatus) |
| `outcome` | enum | No | Result of the activity. See [ActivityOutcome enum](#activityoutcome) |
| `reminderAt` | ISO datetime | No | When to send a reminder (e.g. `2024-06-01T09:00:00Z`) |
| `location` | string | No | Location (for meetings). Max 300 chars |
| `duration` | integer | No | Duration in minutes |
| `dealId` | UUID | No | Link to a deal |
| `companyId` | UUID | No | Link to a company |

**Response:** `201 Created` – the created Activity object. Also updates `lastActivityAt` on the linked contact.

---

#### `GET /api/v1/activities/:id`
Get a single activity (includes nested `contact`, `deal`, `company`).

---

#### `PATCH /api/v1/activities/:id`
Update an activity. `dealId` and `companyId` can be set to `null`.

---

#### `DELETE /api/v1/activities/:id`
Soft delete. **Response:** `204 No Content`

---

#### `PATCH /api/v1/activities/:id/restore`
Restore a soft-deleted activity.

---

#### `POST /api/v1/activities/bulk-delete`
```json
{ "ids": ["uuid1", "uuid2"] }
```

---

### Reports

All report endpoints require the standard workspace/user headers. They return pre-aggregated analytics data for dashboard widgets and are read-only (GET only).

---

#### `GET /api/v1/reports`
Report catalog — returns metadata for every available report endpoint.

**Response:**
```json
{
  "total": 12,
  "data": [
    {
      "id": "kpi-summary",
      "title": "Key Metrics",
      "description": "Top-level KPIs: total pipeline value, active contacts, deals won this month, and activities this week.",
      "endpoint": "/api/v1/reports/kpi-summary",
      "category": "overview",
      "widgetType": "kpi-cards"
    },
    {
      "id": "revenue-forecast",
      "title": "Revenue Forecast",
      "description": "Projected revenue per month based on open deal values and probability.",
      "endpoint": "/api/v1/deals/reports/revenue-forecast",
      "category": "deals",
      "widgetType": "forecast",
      "params": [
        { "name": "months", "type": "number", "default": 6, "description": "Number of months to forecast (1–24)." }
      ]
    }
  ]
}
```

Each catalog entry contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable identifier |
| `title` | string | Human-readable name |
| `description` | string | What the report shows |
| `endpoint` | string | Full API path to call |
| `category` | string | `overview` / `deals` / `activities` / `contacts` / `companies` |
| `widgetType` | string | Suggested widget type for the dashboard |
| `params` | array | Optional query parameters with defaults |

---

#### `GET /api/v1/reports/kpi-summary`
Top-level KPI cards: total pipeline value, active contacts, deals won this month, and activities this week.

**Response:**
```json
{
  "totalPipeline": 4250000,
  "activeContacts": 87,
  "dealsWonThisMonth": { "count": 4, "value": 980000 },
  "activitiesThisWeek": 23
}
```

> All monetary values are in cents (smallest currency unit).

---

#### `GET /api/v1/deals/reports/pipeline-funnel`
Deal count and value at each pipeline stage with stage-to-stage conversion rates.

**Response:**
```json
{
  "data": [
    { "stage": "prospecting",   "count": 9,  "totalValue": 3200000, "conversionRate": null },
    { "stage": "qualification", "count": 7,  "totalValue": 2800000, "conversionRate": 77.8 },
    { "stage": "proposal",      "count": 5,  "totalValue": 2100000, "conversionRate": 71.4 },
    { "stage": "negotiation",   "count": 3,  "totalValue": 1500000, "conversionRate": 60.0 },
    { "stage": "closed-won",    "count": 18, "totalValue": 8400000, "conversionRate": null }
  ]
}
```

---

#### `GET /api/v1/deals/reports/revenue-forecast`
Projected revenue per month based on open deal values and their win probability.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `months` | integer | `6` | Look-ahead window in months (1–24) |

**Response:**
```json
{
  "data": [
    { "month": "2025-05", "expectedRevenue": 1240000, "dealCount": 4 },
    { "month": "2025-06", "expectedRevenue": 980000,  "dealCount": 3 }
  ]
}
```

> `expectedRevenue` = `SUM(deal_value × probability / 100)` for deals with `expected_close_date` in that month.

---

#### `GET /api/v1/deals/reports/win-loss`
Monthly won vs. lost deal counts and values, win rate, and top lost reasons.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `12m` | Look-back window: `3m`, `6m`, `12m`, or `ytd` |

**Response:**
```json
{
  "summary": { "won": 18, "lost": 12, "winRate": 60.0 },
  "monthly": [
    { "month": "2024-05", "won": 2, "lost": 1, "wonValue": 450000, "lostValue": 200000 }
  ],
  "lostReasons": [
    { "reason": "price", "count": 4 },
    { "reason": "competition", "count": 3 }
  ]
}
```

---

#### `GET /api/v1/deals/reports/value-distribution`
Deal count split into four value buckets.

**Response:**
```json
{
  "data": [
    { "bucket": "<$10k",       "count": 8,  "totalValue": 480000  },
    { "bucket": "$10k–$50k",   "count": 15, "totalValue": 3200000 },
    { "bucket": "$50k–$100k",  "count": 10, "totalValue": 6800000 },
    { "bucket": ">$100k",      "count": 7,  "totalValue": 9500000 }
  ]
}
```

---

#### `GET /api/v1/deals/reports/top-deals`
Highest-value deals (open and won) with company and assignee details.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | `10` | Number of results (1–50) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Enterprise License",
      "dealValue": 18500000,
      "status": "OPEN",
      "stage": "negotiation",
      "companyName": "Acme Corp",
      "assignedToName": "Alice Johnson",
      "expectedCloseDate": "2025-09-30"
    }
  ]
}
```

---

#### `GET /api/v1/deals/reports/by-stage`
Count and total value of all non-deleted deals grouped by stage.

**Response:**
```json
{
  "data": [
    { "stage": "prospecting", "count": "5", "totalValue": "250000" },
    { "stage": "proposal",    "count": "3", "totalValue": "180000" }
  ]
}
```

---

#### `GET /api/v1/deals/reports/by-month`
Deal count and value created each month over the last 12 months.

**Response:**
```json
{
  "data": [
    { "month": "2024-05", "count": "8",  "totalValue": "420000" },
    { "month": "2024-06", "count": "12", "totalValue": "610000" }
  ]
}
```

---

#### `GET /api/v1/activities/reports/by-type`
Activity count by type for the workspace.

**Response:**
```json
{
  "data": [
    { "type": "call",    "count": "75" },
    { "type": "email",   "count": "62" },
    { "type": "meeting", "count": "50" }
  ]
}
```

---

#### `GET /api/v1/activities/reports/by-user`
Per-user activity breakdown by type over the **last 30 days**.

**Response:**
```json
{
  "data": [
    {
      "userName": "Alice Johnson",
      "activities": { "call": 12, "email": 8, "meeting": 5 },
      "total": 25
    },
    {
      "userName": "Bob Martinez",
      "activities": { "call": 7, "task": 9 },
      "total": 16
    }
  ]
}
```

---

#### `GET /api/v1/contacts/reports/growth`
Monthly new contacts added and running cumulative total over the last 12 months.

**Response:**
```json
{
  "data": [
    { "month": "2024-05", "newContacts": 8,  "cumulative": 42 },
    { "month": "2024-06", "newContacts": 12, "cumulative": 54 }
  ]
}
```

---

#### `GET /api/v1/companies/reports/by-industry`
Company count and percentage share split by industry.

**Response:**
```json
{
  "data": [
    { "industry": "technology", "count": 8,  "percentage": 22.9 },
    { "industry": "finance",    "count": 7,  "percentage": 20.0 },
    { "industry": "healthcare", "count": 5,  "percentage": 14.3 }
  ]
}
```

---

### Users

Base path: `/api/v1/users`

#### `GET /api/v1/users`
List all users in workspace with pagination, search, and sorting.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page (max 100) |
| `search` | string | Search fullName, email |
| `sortBy` | string | `createdAt`, `updatedAt`, `fullName`, `email`, `status` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of User objects.

#### `POST /api/v1/users`
Invite/create a user.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | Yes | Full name (min 2 chars) |
| `email` | string (email) | No | Email address |
| `avatarUrl` | string (URL) | No | Avatar image URL |
| `role` | enum | No | `OWNER`, `ADMIN`, `MEMBER`. Default: `MEMBER` |
| `externalAuthProvider` | string | No | Auth provider identifier |
| `externalAuthId` | string | No | External auth subject ID |

#### `GET /api/v1/users/:id`
Get a single user.

#### `PATCH /api/v1/users/:id`
Update user profile.

#### `DELETE /api/v1/users/:id`
Soft delete user and remove workspace membership.

#### `PATCH /api/v1/users/:id/restore`
Restore a soft-deleted user.

#### `PATCH /api/v1/users/:id/role`
Update user's workspace role.

**Request Body:**
```json
{ "role": "ADMIN" }
```

---

### Dashboard Bootstrap

#### `GET /api/v1/bootstrap`
Get the user's dashboard configuration (stored in MongoDB). Creates a default config with all widgets if none exists yet (get-or-create).

**Response:**
```json
{
  "_id": "mongo-object-id",
  "userId": "uuid",
  "workspaceId": "uuid",
  "theme": "light",
  "gridCols": 12,
  "rowHeight": 80,
  "widgets": [
    {
      "id": "kpi-summary",
      "type": "kpi-cards",
      "title": "Key Metrics",
      "dataSource": "/api/v1/reports/kpi-summary",
      "layout": { "x": 0, "y": 0, "w": 12, "h": 2 },
      "chartConfig": {},
      "refreshInterval": 300000
    },
    {
      "id": "pipeline-funnel",
      "type": "funnel",
      "title": "Sales Pipeline",
      "dataSource": "/api/v1/deals/reports/pipeline-funnel",
      "layout": { "x": 0, "y": 2, "w": 6, "h": 4 },
      "chartConfig": { "chartType": "bar", "colorScheme": "blue" },
      "refreshInterval": 300000
    }
  ],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

#### `PUT /api/v1/bootstrap`
Update dashboard configuration (upserts — creates if not found).

**Request Body** (all fields optional):

| Field | Type | Description |
|-------|------|-------------|
| `theme` | `"light"` \| `"dark"` | Dashboard colour theme |
| `widgets` | array | Full widget array to replace the stored configuration |

**Widget object schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Stable widget identifier |
| `type` | string | Yes | Widget type (e.g. `kpi-cards`, `funnel`, `line`) |
| `title` | string | Yes | Display title |
| `dataSource` | string | Yes | API path the widget fetches from |
| `layout.x` | integer | Yes | Grid column position (0-based) |
| `layout.y` | integer | Yes | Grid row position (0-based) |
| `layout.w` | integer | Yes | Width in grid columns (2–12) |
| `layout.h` | integer | Yes | Height in grid rows (2–8) |
| `chartConfig.chartType` | string | No | `bar`, `line`, `area`, `pie`, `donut`, `funnel`, `table` |
| `chartConfig.colorScheme` | string | No | `blue`, `green`, `purple`, `orange`, `red` |
| `chartConfig.showLegend` | boolean | No | Show chart legend |
| `chartConfig.showGrid` | boolean | No | Show grid lines |
| `chartConfig.showArea` | boolean | No | Show area fill under line charts |
| `chartConfig.stacked` | boolean | No | Stack bars/areas |
| `refreshInterval` | integer | No | Auto-refresh in ms. Default: `300000` (5 min) |

**Response:** Updated config document.

---

## Data Models & Field Reference

### Company

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `name` | string | No | Company name |
| `email` | string | No | Company email |
| `phone` | string (max 30) | No | Phone number |
| `website` | string (URL) | No | Website URL |
| `industry` | enum | No | Industry type |
| `country` | string | No | Country |
| `state` | string | No | State/Province |
| `city` | string | No | City |
| `address` | string | No | Street address |
| `postalCode` | string | No | Postal code (max 20 chars) |
| `leadSource` | enum | No | How company was acquired |
| `status` | enum | No | Default: `prospect` |
| `companySize` | enum | Yes | Employee size band |
| `numberOfEmployees` | integer | Yes | Actual employee count |
| `annualRevenue` | integer | Yes | Annual revenue (cents) |
| `linkedinUrl` | string | Yes | LinkedIn company URL |
| `timezone` | string | Yes | IANA timezone |
| `description` | string | Yes | Notes |
| `lastActivityAt` | datetime | Yes | Auto-updated on new activity |
| `lastActivityAt` | datetime | Yes | Auto-updated on new activity |
| `workspaceId` | UUID | No | Workspace |
| `ownerId` | UUID | Yes | Owner user ID |
| `owner` | object | Yes | `{ id, fullName }` — resolved owner |
| `createdBy` | UUID | Yes | Creator user ID |
| `createdByUser` | object | Yes | `{ id, fullName }` — resolved creator |
| `updatedBy` | UUID | Yes | Last updater user ID |
| `updatedByUser` | object | Yes | `{ id, fullName }` — resolved last updater |
| `deletedBy` | UUID | Yes | Deleter |
| `createdAt` | datetime | No | Creation timestamp |
| `updatedAt` | datetime | No | Last update timestamp |
| `deletedAt` | datetime | Yes | Soft delete timestamp |

---

### Contact

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `name` | string | No | Full name |
| `email` | string | No | Email address |
| `phone` | string (max 30) | Yes | Office phone |
| `mobile` | string (max 30) | Yes | Mobile number |
| `jobTitle` | string | Yes | Job title |
| `department` | string | Yes | Department (max 120 chars) |
| `linkedinUrl` | string | Yes | LinkedIn profile URL |
| `status` | enum | No | Default: `active` |
| `leadSource` | enum | Yes | Acquisition source |
| `preferredContactMethod` | enum | Yes | `email`, `phone`, or `mobile` |
| `isPrimary` | boolean | No | Primary contact flag. Default: `false` |
| `doNotContact` | boolean | No | DNC flag. Default: `false` |
| `companyId` | UUID | No | Parent company |
| `company` | object | Yes | Nested company object |
| `assignedTo` | UUID | No | Assigned user ID |
| `assignedUser` | object | Yes | `{ id, fullName }` — resolved assigned user |
| `ownerId` | UUID | Yes | Owner user ID |
| `owner` | object | Yes | `{ id, fullName }` — resolved owner |
| `lastActivityAt` | datetime | Yes | Auto-updated on new activity |
| `workspaceId` | UUID | No | Workspace |
| `createdBy` | UUID | Yes | Creator user ID |
| `createdByUser` | object | Yes | `{ id, fullName }` — resolved creator |
| `updatedBy` | UUID | Yes | Last updater user ID |
| `updatedByUser` | object | Yes | `{ id, fullName }` — resolved last updater |
| `deletedBy` | UUID | Yes | Deleter |
| `createdAt` | datetime | No | Creation timestamp |
| `updatedAt` | datetime | No | Last update timestamp |
| `deletedAt` | datetime | Yes | Soft delete timestamp |

---

### Deal

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `title` | string | No | Deal title (max 200 chars) |
| `dealValue` | integer | No | Value in smallest currency unit |
| `currency` | string | No | 3-letter ISO code. Default: `AUD` |
| `status` | enum | No | Default: `OPEN` |
| `stage` | enum | No | Pipeline stage |
| `priority` | enum | No | Priority level |
| `probability` | integer | Yes | Win probability 0-100 |
| `expectedCloseDate` | date | Yes | Expected close (YYYY-MM-DD) |
| `actualCloseDate` | date | Yes | Actual close date |
| `lostReason` | enum | Yes | Required if `status = LOST` |
| `source` | enum | Yes | Deal origin source |
| `description` | string | Yes | Notes |
| `companyId` | UUID | No | Associated company |
| `contactId` | UUID | Yes | Associated contact |
| `assignedTo` | UUID | No | Assigned user ID |
| `assignedUser` | object | Yes | `{ id, fullName }` — resolved assigned user |
| `ownerId` | UUID | Yes | Owner user ID |
| `owner` | object | Yes | `{ id, fullName }` — resolved owner |
| `workspaceId` | UUID | No | Workspace |
| `createdBy` | UUID | Yes | Creator user ID |
| `createdByUser` | object | Yes | `{ id, fullName }` — resolved creator |
| `updatedBy` | UUID | Yes | Last updater user ID |
| `updatedByUser` | object | Yes | `{ id, fullName }` — resolved last updater |
| `deletedBy` | UUID | Yes | Deleter |
| `createdAt` | datetime | No | Creation timestamp |
| `updatedAt` | datetime | No | Last update timestamp |
| `deletedAt` | datetime | Yes | Soft delete timestamp |

---

### Activity

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `type` | enum | No | Activity type |
| `subject` | string | No | Subject/title (max 200 chars) |
| `body` | string | Yes | Notes/description |
| `priority` | enum | No | Priority level |
| `status` | enum | No | Default: `OPEN` |
| `outcome` | enum | Yes | Result of the activity |
| `dueDate` | date | No | Due date (YYYY-MM-DD) |
| `dueTime` | time | No | Due time (HH:MM) |
| `reminderAt` | datetime | Yes | Reminder timestamp |
| `location` | string | Yes | Meeting location (max 300 chars) |
| `duration` | integer | Yes | Duration in minutes |
| `contactId` | UUID | No | Linked contact |
| `dealId` | UUID | Yes | Linked deal |
| `companyId` | UUID | Yes | Linked company |
| `assignedTo` | UUID | No | Assigned user ID |
| `assignedUser` | object | Yes | `{ id, fullName }` — resolved assigned user |
| `ownerId` | UUID | Yes | Owner user ID |
| `owner` | object | Yes | `{ id, fullName }` — resolved owner |
| `workspaceId` | UUID | No | Workspace |
| `createdBy` | UUID | Yes | Creator user ID |
| `createdByUser` | object | Yes | `{ id, fullName }` — resolved creator |
| `updatedBy` | UUID | Yes | Last updater user ID |
| `updatedByUser` | object | Yes | `{ id, fullName }` — resolved last updater |
| `deletedBy` | UUID | Yes | Deleter |
| `createdAt` | datetime | No | Creation timestamp |
| `updatedAt` | datetime | No | Last update timestamp |
| `deletedAt` | datetime | Yes | Soft delete timestamp |

---

## Enum Reference

### Industry
`technology` | `finance` | `healthcare` | `retail` | `manufacturing` | `education` | `real-estate`

### CompanySize
`1-10` | `11-50` | `51-200` | `201-500` | `501-1000` | `1000+`

### LeadSource
`website` | `referral` | `cold-call` | `social-media` | `event` | `partner` | `advertising` | `other`

### CompanyStatus
`prospect` | `active` | `churned` | `inactive`

### ContactStatus
`active` | `inactive` | `bounced` | `unsubscribed`

### PreferredContactMethod
`email` | `phone` | `mobile`

### DealStatus
`OPEN` | `WON` | `LOST`

### DealStage
`prospecting` | `qualification` | `proposal` | `negotiation` | `closed-won` | `closed-lost`

### DealPriority
`low` | `medium` | `high` | `urgent`

### DealLostReason
`price` | `competition` | `timing` | `no-budget` | `no-decision` | `product-fit` | `other`

### ActivityType
`call` | `email` | `meeting` | `task` | `note` | `deadline`

### ActivityPriority
`low` | `medium` | `high`

### ActivityStatus
`OPEN` | `DONE`

### ActivityOutcome
`completed` | `no-answer` | `left-voicemail` | `rescheduled`

### WorkspaceRole
`OWNER` | `ADMIN` | `MEMBER`

---

## Quick Reference – All Endpoints

```
GET    /health

# ── Reports (overview) ────────────────────────────────────────────────────────
GET    /api/v1/reports                              # report catalog
GET    /api/v1/reports/kpi-summary                 # KPI cards

# ── Companies ─────────────────────────────────────────────────────────────────
GET    /api/v1/companies/reports/by-industry       # companies by industry
GET    /api/v1/companies
POST   /api/v1/companies
POST   /api/v1/companies/bulk-delete
GET    /api/v1/companies/:id
PATCH  /api/v1/companies/:id
DELETE /api/v1/companies/:id
PATCH  /api/v1/companies/:id/restore
GET    /api/v1/companies/:id/contacts
GET    /api/v1/companies/:id/deals

# ── Contacts ──────────────────────────────────────────────────────────────────
GET    /api/v1/contacts/reports/growth             # contact growth over time
GET    /api/v1/contacts
POST   /api/v1/contacts
POST   /api/v1/contacts/bulk-delete
GET    /api/v1/contacts/:id
PATCH  /api/v1/contacts/:id
DELETE /api/v1/contacts/:id
PATCH  /api/v1/contacts/:id/restore
GET    /api/v1/contacts/:id/deals
GET    /api/v1/contacts/:id/activities

# ── Deals ─────────────────────────────────────────────────────────────────────
GET    /api/v1/deals/reports/by-stage              # deals grouped by stage
GET    /api/v1/deals/reports/by-month              # deals per month (12mo)
GET    /api/v1/deals/reports/pipeline-funnel       # funnel with conversion rates
GET    /api/v1/deals/reports/revenue-forecast      # forecast (?months=6)
GET    /api/v1/deals/reports/win-loss              # win/loss analysis (?period=12m)
GET    /api/v1/deals/reports/value-distribution    # deal value buckets
GET    /api/v1/deals/reports/top-deals             # top deals (?limit=10)
GET    /api/v1/deals
POST   /api/v1/deals
POST   /api/v1/deals/bulk-delete
GET    /api/v1/deals/:id
PATCH  /api/v1/deals/:id
DELETE /api/v1/deals/:id
PATCH  /api/v1/deals/:id/restore
GET    /api/v1/deals/:id/activities

# ── Activities ────────────────────────────────────────────────────────────────
GET    /api/v1/activities/reports/by-type          # activities by type
GET    /api/v1/activities/reports/by-user          # per-user breakdown (30 days)
GET    /api/v1/activities
POST   /api/v1/activities
POST   /api/v1/activities/bulk-delete
GET    /api/v1/activities/:id
PATCH  /api/v1/activities/:id
DELETE /api/v1/activities/:id
PATCH  /api/v1/activities/:id/restore

# ── Users ─────────────────────────────────────────────────────────────────────
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
PATCH  /api/v1/users/:id/restore
PATCH  /api/v1/users/:id/role

# ── Dashboard ─────────────────────────────────────────────────────────────────
GET    /api/v1/bootstrap
PUT    /api/v1/bootstrap
```
