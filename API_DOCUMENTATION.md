# CRM Backend — API Documentation

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
| `x-workspace-id` | UUID string | ✅ Yes | Tenant/workspace identifier |
| `x-user-id` | UUID string | ✅ Yes | Currently acting user identifier |
| `Content-Type` | string | ✅ Yes (on POST/PATCH) | `application/json` |

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
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

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
| `search` | string | — | Text search across key fields |
| `sortBy` | string | `createdAt` | Field to sort by (see per-entity allowed fields) |
| `sortOrder` | `ASC` \| `DESC` | `DESC` | Sort direction |

### Entity-Specific Filter Parameters

**Companies:** `status`, `industry`, `ownerId`
**Contacts:** `status`, `companyId`, `assignedTo`, `ownerId`, `doNotContact`
**Deals:** `status`, `stage`, `priority`, `companyId`, `contactId`, `assignedTo`, `ownerId`
**Activities:** `type`, `status`, `priority`, `contactId`, `dealId`, `companyId`, `assignedTo`, `ownerId`

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

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Company name |
| `email` | string (email) | ✅ | Company email address |
| `phone` | string | ✅ | Phone number |
| `website` | string (URL) | ✅ | Company website URL |
| `industry` | enum | ✅ | See [Industry enum](#industry) |
| `country` | string | ✅ | Country name |
| `state` | string | ✅ | State/Province |
| `city` | string | ✅ | City |
| `address` | string | ✅ | Street address |
| `postcode` | string | ✅ | Postal code (max 20 chars) |
| `leadSource` | enum | ✅ | See [LeadSource enum](#leadsource) |
| `companySize` | enum | ❌ | See [CompanySize enum](#companysize) |
| `numberOfEmployees` | integer | ❌ | Actual employee headcount |
| `annualRevenue` | integer | ❌ | Annual revenue in cents |
| `linkedinUrl` | string (URL) | ❌ | LinkedIn company page URL |
| `timezone` | string | ❌ | IANA timezone (e.g. `Australia/Sydney`) |
| `status` | enum | ❌ | Default: `prospect`. See [CompanyStatus enum](#companystatus) |
| `description` | string | ❌ | Free-text description |
| `ownerId` | UUID | ❌ | Assign an owner user ID |

**Response:** `201 Created` — the created Company object.

---

#### `GET /api/v1/companies/:id`
Get a single company by ID.

**Response:** Company object.

---

#### `PATCH /api/v1/companies/:id`
Update a company (partial update — only send fields to change).

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
Get all contacts belonging to a company.

**Response:** Array of Contact objects (no pagination).

---

#### `GET /api/v1/companies/:id/deals`
Get all deals belonging to a company (paginated).

**Query Parameters:** `page`, `limit`

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
| `search` | string | Search firstName, lastName, email, mobile, jobTitle |
| `status` | string | Filter: `active`, `inactive`, `bounced`, `unsubscribed` |
| `companyId` | UUID | Filter contacts by company |
| `assignedTo` | UUID | Filter by assigned user |
| `ownerId` | UUID | Filter by owner |
| `doNotContact` | boolean | `true` or `false` |
| `sortBy` | string | `createdAt`, `firstName`, `lastName`, `email`, `status`, `lastActivityAt` |
| `sortOrder` | string | `ASC` or `DESC` |

**Response:** Paginated list of Contact objects (includes nested `company` object).

---

#### `POST /api/v1/contacts`
Create a new contact.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyId` | UUID | ✅ | Company this contact belongs to |
| `firstName` | string | ✅ | First name |
| `lastName` | string | ✅ | Last name |
| `email` | string (email) | ✅ | Email address |
| `assignedTo` | UUID | ✅ | User ID this contact is assigned to |
| `phone` | string | ❌ | Office/work phone |
| `mobile` | string | ❌ | Mobile number |
| `jobTitle` | string | ❌ | Job title |
| `department` | string | ❌ | Department within company (max 120 chars) |
| `linkedinUrl` | string (URL) | ❌ | LinkedIn profile URL |
| `isPrimary` | boolean | ❌ | Is primary contact for company. Default: `false` |
| `status` | enum | ❌ | Default: `active`. See [ContactStatus enum](#contactstatus) |
| `leadSource` | enum | ❌ | How this contact was acquired. See [LeadSource enum](#leadsource) |
| `preferredContactMethod` | enum | ❌ | `email`, `phone`, or `mobile` |
| `doNotContact` | boolean | ❌ | DNC flag. Default: `false` |

**Response:** `201 Created` — the created Contact object.

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

---

#### `GET /api/v1/contacts/:id/activities`
Get all activities associated with a contact (paginated).

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

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Deal title (max 200 chars) |
| `dealValue` | integer | ✅ | Deal value in smallest currency unit (e.g. cents). Must be ≥ 0 |
| `stage` | enum | ✅ | See [DealStage enum](#dealstage) |
| `priority` | enum | ✅ | See [DealPriority enum](#dealpriority) |
| `companyId` | UUID | ✅ | Company associated with the deal |
| `assignedTo` | UUID | ✅ | User this deal is assigned to |
| `contactId` | UUID | ❌ | Contact associated (must belong to `companyId`) |
| `currency` | string | ❌ | 3-letter ISO currency code. Default: `AUD` |
| `status` | enum | ❌ | Default: `OPEN`. See [DealStatus enum](#dealstatus) |
| `lostReason` | enum | ❌* | **Required when `status` is `LOST`**. See [DealLostReason enum](#deallostreason) |
| `probability` | integer | ❌ | Win probability 0–100 |
| `expectedCloseDate` | date (YYYY-MM-DD) | ❌ | Expected close date |
| `actualCloseDate` | date (YYYY-MM-DD) | ❌ | Actual close date |
| `source` | enum | ❌ | How deal originated. See [LeadSource enum](#leadsource) |
| `description` | string | ❌ | Free-text notes |

**Response:** `201 Created` — the created Deal object.

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

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | ✅ | See [ActivityType enum](#activitytype) |
| `priority` | enum | ✅ | See [ActivityPriority enum](#activitypriority) |
| `subject` | string | ✅ | Activity subject/title (max 200 chars) |
| `dueDate` | string (YYYY-MM-DD) | ✅ | Due date |
| `dueTime` | string (HH:MM) | ✅ | Due time in HH:MM or HH:MM:SS |
| `contactId` | UUID | ✅ | Contact this activity is linked to |
| `assignedTo` | UUID | ✅ | User this activity is assigned to |
| `body` | string | ❌ | Activity notes/body |
| `status` | enum | ❌ | Default: `OPEN`. See [ActivityStatus enum](#activitystatus) |
| `outcome` | enum | ❌ | Result of the activity. See [ActivityOutcome enum](#activityoutcome) |
| `location` | string | ❌ | Location (for meetings). Max 300 chars |
| `duration` | integer | ❌ | Duration in minutes |
| `reminderAt` | ISO datetime | ❌ | When to send a reminder (e.g. `2024-06-01T09:00:00Z`) |
| `dealId` | UUID | ❌ | Link to a deal |
| `companyId` | UUID | ❌ | Link to a company |

**Response:** `201 Created` — the created Activity object. Also updates `lastActivityAt` on the linked contact.

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

#### `GET /api/v1/deals/reports/by-stage`
Pipeline breakdown: count and total value of open deals grouped by stage.

**Response:**
```json
{
  "data": [
    { "stage": "prospecting", "count": "5", "totalValue": "250000" },
    { "stage": "proposal", "count": "3", "totalValue": "180000" }
  ]
}
```

---

#### `GET /api/v1/deals/reports/by-month`
Monthly deal trend: count and total value for the last 12 months.

**Response:**
```json
{
  "data": [
    { "month": "2024-01", "count": "8", "totalValue": "420000" },
    { "month": "2024-02", "count": "12", "totalValue": "610000" }
  ]
}
```

---

#### `GET /api/v1/activities/reports/by-type`
Activity breakdown by type.

**Response:**
```json
{
  "data": [
    { "type": "call", "count": "24" },
    { "type": "meeting", "count": "11" }
  ]
}
```

---

### Users

Base path: `/api/v1/users`

#### `GET /api/v1/users`
List all users in workspace.

#### `POST /api/v1/users`
Invite/create a user.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | ✅ | Full name (min 2 chars) |
| `email` | string (email) | ❌ | Email address |
| `avatarUrl` | string (URL) | ❌ | Avatar image URL |
| `role` | enum | ❌ | `OWNER`, `ADMIN`, `MEMBER`. Default: `MEMBER` |
| `externalAuthProvider` | string | ❌ | Auth provider identifier |
| `externalAuthId` | string | ❌ | External auth subject ID |

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
Get or create the user's dashboard configuration (stored in MongoDB).

**Response:**
```json
{
  "userId": "uuid",
  "workspaceId": "uuid",
  "layout": "default",
  "items": [],
  "colors": {}
}
```

#### `PUT /api/v1/bootstrap`
Update dashboard configuration.

---

## Data Models & Field Reference

### Company

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `name` | string | No | Company name |
| `email` | string | No | Company email |
| `phone` | string | No | Phone number |
| `website` | string (URL) | No | Website URL |
| `industry` | enum | No | Industry type |
| `companySize` | enum | Yes | Employee size band |
| `numberOfEmployees` | integer | Yes | Actual employee count |
| `annualRevenue` | integer | Yes | Annual revenue (cents) |
| `linkedinUrl` | string | Yes | LinkedIn company URL |
| `timezone` | string | Yes | IANA timezone |
| `country` | string | No | Country |
| `state` | string | No | State/Province |
| `city` | string | No | City |
| `address` | string | No | Street address |
| `postcode` | string | No | Postal code |
| `leadSource` | enum | No | How company was acquired |
| `status` | enum | No | Default: `prospect` |
| `description` | string | Yes | Notes |
| `lastActivityAt` | datetime | Yes | Auto-updated on new activity |
| `workspaceId` | UUID | No | Workspace |
| `ownerId` | UUID | Yes | Owner user |
| `createdBy` | UUID | Yes | Creator user |
| `updatedBy` | UUID | Yes | Last updater |
| `createdAt` | datetime | No | Creation timestamp |
| `updatedAt` | datetime | No | Last update timestamp |
| `deletedAt` | datetime | Yes | Soft delete timestamp |

---

### Contact

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `companyId` | UUID | No | Parent company |
| `firstName` | string | No | First name |
| `lastName` | string | No | Last name |
| `email` | string | No | Email address |
| `phone` | string | Yes | Office phone |
| `mobile` | string | Yes | Mobile number |
| `jobTitle` | string | Yes | Job title |
| `department` | string | Yes | Department (max 120 chars) |
| `linkedinUrl` | string | Yes | LinkedIn profile URL |
| `isPrimary` | boolean | No | Primary contact flag. Default: `false` |
| `status` | enum | No | Default: `active` |
| `leadSource` | enum | Yes | Acquisition source |
| `preferredContactMethod` | enum | Yes | `email`, `phone`, or `mobile` |
| `doNotContact` | boolean | No | DNC flag. Default: `false` |
| `lastActivityAt` | datetime | Yes | Auto-updated on new activity |
| `workspaceId` | UUID | No | Workspace |
| `ownerId` | UUID | Yes | Owner user |
| `assignedTo` | UUID | No | Assigned user |
| `createdBy` | UUID | Yes | Creator |
| `updatedBy` | UUID | Yes | Last updater |
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
| `lostReason` | enum | Yes | Required if `status = LOST` |
| `probability` | integer | Yes | Win probability 0–100 |
| `expectedCloseDate` | date | Yes | Expected close (YYYY-MM-DD) |
| `actualCloseDate` | date | Yes | Actual close date |
| `source` | enum | Yes | Deal origin source |
| `description` | string | Yes | Notes |
| `companyId` | UUID | No | Associated company |
| `contactId` | UUID | Yes | Associated contact |
| `workspaceId` | UUID | No | Workspace |
| `ownerId` | UUID | Yes | Owner user |
| `assignedTo` | UUID | No | Assigned user |
| `createdBy` | UUID | Yes | Creator |
| `updatedBy` | UUID | Yes | Last updater |
| `createdAt` | datetime | No | Creation timestamp |
| `updatedAt` | datetime | No | Last update timestamp |
| `deletedAt` | datetime | Yes | Soft delete timestamp |

---

### Activity

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Primary key |
| `type` | enum | No | Activity type |
| `priority` | enum | No | Priority level |
| `status` | enum | No | Default: `OPEN` |
| `subject` | string | No | Subject/title (max 200 chars) |
| `body` | string | Yes | Notes/description |
| `outcome` | enum | Yes | Result of the activity |
| `location` | string | Yes | Meeting location (max 300 chars) |
| `duration` | integer | Yes | Duration in minutes |
| `reminderAt` | datetime | Yes | Reminder timestamp |
| `dueDate` | date | No | Due date (YYYY-MM-DD) |
| `dueTime` | time | No | Due time (HH:MM) |
| `contactId` | UUID | No | Linked contact |
| `dealId` | UUID | Yes | Linked deal |
| `companyId` | UUID | Yes | Linked company |
| `workspaceId` | UUID | No | Workspace |
| `ownerId` | UUID | Yes | Owner user |
| `assignedTo` | UUID | No | Assigned user |
| `createdBy` | UUID | Yes | Creator |
| `updatedBy` | UUID | Yes | Last updater |
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

## Quick Reference — All Endpoints

```
GET    /health

GET    /api/v1/companies
POST   /api/v1/companies
POST   /api/v1/companies/bulk-delete
GET    /api/v1/companies/:id
PATCH  /api/v1/companies/:id
DELETE /api/v1/companies/:id
PATCH  /api/v1/companies/:id/restore
GET    /api/v1/companies/:id/contacts
GET    /api/v1/companies/:id/deals

GET    /api/v1/contacts
POST   /api/v1/contacts
POST   /api/v1/contacts/bulk-delete
GET    /api/v1/contacts/:id
PATCH  /api/v1/contacts/:id
DELETE /api/v1/contacts/:id
PATCH  /api/v1/contacts/:id/restore
GET    /api/v1/contacts/:id/deals
GET    /api/v1/contacts/:id/activities

GET    /api/v1/deals/reports/by-stage
GET    /api/v1/deals/reports/by-month
GET    /api/v1/deals
POST   /api/v1/deals
POST   /api/v1/deals/bulk-delete
GET    /api/v1/deals/:id
PATCH  /api/v1/deals/:id
DELETE /api/v1/deals/:id
PATCH  /api/v1/deals/:id/restore
GET    /api/v1/deals/:id/activities

GET    /api/v1/activities/reports/by-type
GET    /api/v1/activities
POST   /api/v1/activities
POST   /api/v1/activities/bulk-delete
GET    /api/v1/activities/:id
PATCH  /api/v1/activities/:id
DELETE /api/v1/activities/:id
PATCH  /api/v1/activities/:id/restore

GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
PATCH  /api/v1/users/:id/restore
PATCH  /api/v1/users/:id/role

GET    /api/v1/bootstrap
PUT    /api/v1/bootstrap
```
