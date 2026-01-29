# Analytics Dashboard API Documentation

**Base URL:** `http://localhost:4000` (development) or your deployed URL
**API Version:** v1
**API Prefix:** `/api/v1`

---

## Table of Contents
1. [Authentication & Headers](#authentication--headers)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Companies](#companies-api)
   - [Contacts](#contacts-api)
   - [Deals](#deals-api)
   - [Activities](#activities-api)
   - [Users](#users-api)
   - [Dashboard Bootstrap](#dashboard-bootstrap-api)
5. [Data Models](#data-models)
6. [Enums](#enums)
7. [Examples](#usage-examples)

---

## Authentication & Headers

### Required Headers for All CRM Endpoints

**All endpoints under `/api/v1/*` (except `/health`) require these headers:**

```http
x-workspace-id: <workspace-uuid>
x-user-id: <user-uuid>
Content-Type: application/json
```

**Example:**
```http
x-workspace-id: 123e4567-e89b-12d3-a456-426614174000
x-user-id: 987fcdeb-51a2-43f7-9abc-123456789def
Content-Type: application/json
```

**Note:** Authorization/JWT is skipped for this demo. In production, use OAuth2/JWT tokens.

---

## Response Format

### Success Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Acme Corporation",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Arrays return list of objects:**
```json
[
  { "id": "...", "name": "..." },
  { "id": "...", "name": "..." }
]
```

---

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, invalid input |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side error |

### Common Errors

**Missing Required Header:**
```json
{
  "statusCode": 400,
  "message": "x-workspace-id header is required"
}
```

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": ["name"],
      "message": "Required"
    }
  ]
}
```

**Not Found:**
```json
{
  "statusCode": 404,
  "message": "Company not found"
}
```

---

## Endpoints

### Health Check

#### GET /health

Check if the server is running.

**No headers required**

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Companies API

### List All Companies
#### GET /api/v1/companies

**Headers Required:** x-workspace-id, x-user-id

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corporation",
    "website": "https://acme.com",
    "industry": "Technology",
    "size": "enterprise",
    "status": "active",
    "email": "contact@acme.com",
    "phone": "+1-555-0100",
    "numberOfEmployees": 5000,
    "annualRevenue": 50000000,
    "street": "123 Tech Street",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "USA",
    "workspaceId": "workspace-uuid",
    "ownerId": "owner-uuid",
    "createdBy": "user-uuid",
    "updatedBy": "user-uuid",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  }
]
```

---

### Get Company by ID
#### GET /api/v1/companies/:id

**Headers Required:** x-workspace-id, x-user-id

**URL Parameters:**
- `id` (UUID) - Company ID

**Response:** Same as single company object above

**Error (404):**
```json
{
  "statusCode": 404,
  "message": "Company not found"
}
```

---

### Create Company
#### POST /api/v1/companies

**Headers Required:** x-workspace-id, x-user-id

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "enterprise",
  "status": "active",
  "email": "contact@acme.com",
  "phone": "+1-555-0100",
  "numberOfEmployees": 5000,
  "annualRevenue": 50000000,
  "street": "123 Tech Street",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94105",
  "country": "USA"
}
```

**Required Fields:**
- `name` (string)

**Optional Fields:**
- All other fields shown above

**Response (201):** Created company object

---

### Update Company
#### PUT /api/v1/companies/:id

**Headers Required:** x-workspace-id, x-user-id

**Request Body:** Same as create, all fields optional

**Response (200):** Updated company object

---

### Delete Company (Soft Delete)
#### DELETE /api/v1/companies/:id

**Headers Required:** x-workspace-id, x-user-id

**Response (200):**
```json
{
  "message": "Company deleted successfully"
}
```

**Note:** This is a soft delete. The company is marked as deleted but not removed from database.

---

## Contacts API

### List All Contacts
#### GET /api/v1/contacts

**Headers Required:** x-workspace-id, x-user-id

**Response:**
```json
[
  {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@acme.com",
    "phone": "+1-555-0101",
    "mobile": "+1-555-0102",
    "jobTitle": "CEO",
    "isPrimary": true,
    "leadSource": "Website",
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105",
    "country": "USA",
    "companyId": "123e4567-e89b-12d3-a456-426614174000",
    "company": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Acme Corporation"
    },
    "workspaceId": "workspace-uuid",
    "ownerId": "owner-uuid",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  }
]
```

---

### Get Contact by ID
#### GET /api/v1/contacts/:id

**Headers Required:** x-workspace-id, x-user-id

**Response:** Single contact object with company relation

---

### Create Contact
#### POST /api/v1/contacts

**Headers Required:** x-workspace-id, x-user-id

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@acme.com",
  "phone": "+1-555-0101",
  "mobile": "+1-555-0102",
  "jobTitle": "CEO",
  "companyId": "123e4567-e89b-12d3-a456-426614174000",
  "isPrimary": true,
  "leadSource": "Website",
  "street": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "postalCode": "94105",
  "country": "USA"
}
```

**Required Fields:**
- `firstName` (string)
- `lastName` (string)

**Optional Fields:**
- All other fields shown above

**Response (201):** Created contact object

---

### Update Contact
#### PUT /api/v1/contacts/:id

**Headers Required:** x-workspace-id, x-user-id

**Request Body:** Same as create, all fields optional

**Response (200):** Updated contact object

---

### Delete Contact (Soft Delete)
#### DELETE /api/v1/contacts/:id

**Headers Required:** x-workspace-id, x-user-id

**Response (200):**
```json
{
  "message": "Contact deleted successfully"
}
```

---

## Deals API

### List All Deals
#### GET /api/v1/deals

**Headers Required:** x-workspace-id, x-user-id

**Response:**
```json
[
  {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "title": "Enterprise Software License",
    "stage": "Negotiation",
    "amountCents": 5000000,
    "currency": "AUD",
    "status": "OPEN",
    "probability": 75,
    "expectedCloseDate": "2024-03-31",
    "description": "Annual enterprise software license deal",
    "priority": "high",
    "source": "Referral",
    "tags": ["enterprise", "recurring"],
    "companyId": "123e4567-e89b-12d3-a456-426614174000",
    "contactId": "456e7890-e89b-12d3-a456-426614174000",
    "ownerId": "owner-uuid",
    "company": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Acme Corporation"
    },
    "contact": {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe"
    },
    "owner": {
      "id": "owner-uuid",
      "fullName": "Jane Smith"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  }
]
```

---

### Get Deal by ID
#### GET /api/v1/deals/:id

**Headers Required:** x-workspace-id, x-user-id

**Response:** Single deal object with relations

---

### Create Deal
#### POST /api/v1/deals

**Headers Required:** x-workspace-id, x-user-id

**Request Body:**
```json
{
  "title": "Enterprise Software License",
  "stage": "Negotiation",
  "ownerId": "owner-uuid",
  "amountCents": 5000000,
  "currency": "AUD",
  "status": "OPEN",
  "probability": 75,
  "expectedCloseDate": "2024-03-31",
  "description": "Annual enterprise software license deal",
  "priority": "high",
  "source": "Referral",
  "tags": ["enterprise", "recurring"],
  "companyId": "123e4567-e89b-12d3-a456-426614174000",
  "contactId": "456e7890-e89b-12d3-a456-426614174000"
}
```

**Required Fields:**
- `title` (string, 1-200 chars)
- `stage` (string, 1-80 chars)
- `ownerId` (UUID)

**Optional Fields:**
- `amountCents` (integer) - Amount in cents
- `currency` (string, 3 chars, default: "AUD")
- `status` (enum: "OPEN" | "WON" | "LOST")
- `probability` (integer, 0-100)
- `expectedCloseDate` (ISO date string)
- `description` (string)
- `priority` (string)
- `source` (string)
- `tags` (array of strings)
- `companyId` (UUID)
- `contactId` (UUID)

**Response (201):** Created deal object

---

### Update Deal
#### PATCH /api/v1/deals/:id

**Headers Required:** x-workspace-id, x-user-id

**Request Body:** Partial deal object (all fields optional)

**Response (200):** Updated deal object

---

### Delete Deal (Soft Delete)
#### DELETE /api/v1/deals/:id

**Headers Required:** x-workspace-id, x-user-id

**Response (200):**
```json
{
  "message": "Deal deleted successfully"
}
```

---

## Activities API

### List All Activities
#### GET /api/v1/activities

**Headers Required:** x-workspace-id, x-user-id

**Response:**
```json
[
  {
    "id": "abc12345-e89b-12d3-a456-426614174000",
    "type": "MEETING",
    "title": "Product Demo",
    "body": "Demonstrated new features to client",
    "status": "DONE",
    "priority": "high",
    "dueAt": "2024-01-20T14:00:00.000Z",
    "ownerId": "owner-uuid",
    "dealId": "789e0123-e89b-12d3-a456-426614174000",
    "companyId": "123e4567-e89b-12d3-a456-426614174000",
    "contactId": "456e7890-e89b-12d3-a456-426614174000",
    "owner": {
      "id": "owner-uuid",
      "fullName": "Jane Smith"
    },
    "deal": {
      "id": "789e0123-e89b-12d3-a456-426614174000",
      "title": "Enterprise Software License"
    },
    "company": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Acme Corporation"
    },
    "contact": {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "deletedAt": null
  }
]
```

---

### Get Activity by ID
#### GET /api/v1/activities/:id

**Headers Required:** x-workspace-id, x-user-id

**Response:** Single activity object with relations

---

### Create Activity
#### POST /api/v1/activities

**Headers Required:** x-workspace-id, x-user-id

**Request Body:**
```json
{
  "type": "MEETING",
  "title": "Product Demo",
  "body": "Demonstrate new features to client",
  "status": "OPEN",
  "priority": "high",
  "dueAt": "2024-01-20T14:00:00.000Z",
  "ownerId": "owner-uuid",
  "dealId": "789e0123-e89b-12d3-a456-426614174000",
  "companyId": "123e4567-e89b-12d3-a456-426614174000",
  "contactId": "456e7890-e89b-12d3-a456-426614174000"
}
```

**Required Fields:**
- `type` (enum: "NOTE" | "CALL" | "EMAIL" | "MEETING" | "TASK")
- `title` (string, 1-200 chars)
- `ownerId` (UUID)

**Optional Fields:**
- `body` (string)
- `status` (enum: "OPEN" | "DONE")
- `priority` (string)
- `dueAt` (ISO datetime string)
- `dealId` (UUID)
- `companyId` (UUID)
- `contactId` (UUID)

**Response (201):** Created activity object

---

### Update Activity
#### PATCH /api/v1/activities/:id

**Headers Required:** x-workspace-id, x-user-id

**Request Body:** Partial activity object (all fields optional)

**Response (200):** Updated activity object

---

### Delete Activity (Soft Delete)
#### DELETE /api/v1/activities/:id

**Headers Required:** x-workspace-id, x-user-id

**Response (200):**
```json
{
  "message": "Activity deleted successfully"
}
```

---

## Users API

### List Workspace Users
#### GET /api/v1/users

**Headers Required:** x-workspace-id, x-user-id

**Response:**
```json
[
  {
    "id": "user-uuid",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "avatarUrl": "https://example.com/avatar.jpg",
    "status": "ACTIVE",
    "externalAuthId": "auth0|123456",
    "externalAuthProvider": "auth0",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "workspaces": [
      {
        "workspaceId": "workspace-uuid",
        "role": "OWNER"
      }
    ]
  }
]
```

---

### Get User by ID
#### GET /api/v1/users/:id

**Headers Required:** x-workspace-id, x-user-id

**Response:** Single user object

---

### Create User (Invite)
#### POST /api/v1/users

**Headers Required:** x-workspace-id, x-user-id

**Request Body:**
```json
{
  "fullName": "John Smith",
  "email": "john@example.com",
  "avatarUrl": "https://example.com/avatar.jpg",
  "externalAuthId": "auth0|789012",
  "externalAuthProvider": "auth0"
}
```

**Required Fields:**
- `fullName` (string, min 2 chars)

**Optional Fields:**
- `email` (string, email format)
- `avatarUrl` (string, URL format)
- `externalAuthId` (string)
- `externalAuthProvider` (string)

**Response (201):** Created user object

**Note:** User is added to workspace with MEMBER role by default

---

### Update User
#### PATCH /api/v1/users/:id

**Headers Required:** x-workspace-id, x-user-id

**Request Body:** Partial user object

**Response (200):** Updated user object

---

### Update User Role
#### PATCH /api/v1/users/:id/role

**Headers Required:** x-workspace-id, x-user-id

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Valid Roles:**
- `OWNER` - Full control
- `ADMIN` - Administrative access
- `MEMBER` - Standard user

**Response (200):**
```json
{
  "message": "Role updated successfully"
}
```

---

### Delete User (Soft Delete)
#### DELETE /api/v1/users/:id

**Headers Required:** x-workspace-id, x-user-id

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Restore Soft-Deleted User
#### PATCH /api/v1/users/:id/restore

**Headers Required:** x-workspace-id, x-user-id

**Response (200):**
```json
{
  "message": "User restored successfully"
}
```

---

## Dashboard Bootstrap API

### Get Dashboard Configuration
#### GET /api/v1/bootstrap

**Headers Required:** x-workspace-id, x-user-id

**Response:**
```json
{
  "id": "config-id",
  "workspaceId": "workspace-uuid",
  "userId": "user-uuid",
  "theme": "light",
  "layout": [
    { "i": "revenue-chart", "x": 0, "y": 0, "w": 6, "h": 4 },
    { "i": "deals-pipeline", "x": 6, "y": 0, "w": 6, "h": 4 }
  ],
  "items": ["revenue-chart", "deals-pipeline"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Note:** Returns empty config if none exists yet

---

### Update Dashboard Configuration
#### PUT /api/v1/bootstrap

**Headers Required:** x-workspace-id, x-user-id

**Request Body:**
```json
{
  "theme": "dark",
  "layout": [
    { "i": "revenue-chart", "x": 0, "y": 0, "w": 12, "h": 4 }
  ],
  "items": ["revenue-chart"]
}
```

**Response (200):** Updated config object

**Note:** Creates new config if none exists

---

## Data Models

### Company
```typescript
{
  id: string;                    // UUID
  name: string;                  // Required
  website?: string;
  industry?: string;
  size?: string;
  status?: string;
  email?: string;
  phone?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  workspaceId: string;           // UUID
  ownerId: string;               // UUID
  createdBy: string;             // UUID
  updatedBy: string;             // UUID
  createdAt: string;             // ISO datetime
  updatedAt: string;             // ISO datetime
  deletedAt: string | null;      // ISO datetime or null
  deletedBy?: string;            // UUID
}
```

### Contact
```typescript
{
  id: string;                    // UUID
  firstName: string;             // Required
  lastName: string;              // Required
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  isPrimary?: boolean;
  leadSource?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  companyId?: string;            // UUID
  company?: Company;             // Populated relation
  workspaceId: string;           // UUID
  ownerId: string;               // UUID
  createdAt: string;             // ISO datetime
  updatedAt: string;             // ISO datetime
  deletedAt: string | null;
}
```

### Deal
```typescript
{
  id: string;                    // UUID
  title: string;                 // Required, 1-200 chars
  stage: string;                 // Required, 1-80 chars
  amountCents?: number;          // Amount in cents
  currency: string;              // Default: "AUD"
  status: "OPEN" | "WON" | "LOST";
  probability?: number;          // 0-100
  expectedCloseDate?: string;    // ISO date
  description?: string;
  priority?: string;
  source?: string;
  tags?: string[];               // Array of strings
  companyId?: string;            // UUID
  contactId?: string;            // UUID
  ownerId: string;               // UUID, required
  company?: Company;
  contact?: Contact;
  owner?: User;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Activity
```typescript
{
  id: string;                    // UUID
  type: "NOTE" | "CALL" | "EMAIL" | "MEETING" | "TASK"; // Required
  title: string;                 // Required, 1-200 chars
  body?: string;
  status: "OPEN" | "DONE";
  priority?: string;
  dueAt?: string;                // ISO datetime
  ownerId: string;               // UUID, required
  dealId?: string;               // UUID
  companyId?: string;            // UUID
  contactId?: string;            // UUID
  owner?: User;
  deal?: Deal;
  company?: Company;
  contact?: Contact;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### User
```typescript
{
  id: string;                    // UUID
  fullName: string;              // Required, min 2 chars
  email?: string;
  avatarUrl?: string;
  status: "ACTIVE" | "INVITED" | "DISABLED";
  externalAuthId?: string;
  externalAuthProvider?: string;
  createdAt: string;
  updatedAt: string;
  workspaces?: WorkspaceMember[];
}
```

---

## Enums

### Deal Status
```typescript
enum DealStatus {
  OPEN = "OPEN",
  WON = "WON",
  LOST = "LOST"
}
```

### Activity Type
```typescript
enum ActivityType {
  NOTE = "NOTE",
  CALL = "CALL",
  EMAIL = "EMAIL",
  MEETING = "MEETING",
  TASK = "TASK"
}
```

### Activity Status
```typescript
enum ActivityStatus {
  OPEN = "OPEN",
  DONE = "DONE"
}
```

### User Status
```typescript
enum UserStatus {
  ACTIVE = "ACTIVE",
  INVITED = "INVITED",
  DISABLED = "DISABLED"
}
```

### Workspace Role
```typescript
enum WorkspaceRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER"
}
```

---

## Usage Examples

### Example 1: Create a Complete Deal Flow

```javascript
// 1. Create a company
const company = await fetch('http://localhost:4000/api/v1/companies', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-workspace-id': 'your-workspace-id',
    'x-user-id': 'your-user-id'
  },
  body: JSON.stringify({
    name: 'TechCorp',
    industry: 'Technology',
    email: 'contact@techcorp.com'
  })
});

const companyData = await company.json();

// 2. Create a contact
const contact = await fetch('http://localhost:4000/api/v1/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-workspace-id': 'your-workspace-id',
    'x-user-id': 'your-user-id'
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@techcorp.com',
    jobTitle: 'CTO',
    companyId: companyData.id,
    isPrimary: true
  })
});

const contactData = await contact.json();

// 3. Create a deal
const deal = await fetch('http://localhost:4000/api/v1/deals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-workspace-id': 'your-workspace-id',
    'x-user-id': 'your-user-id'
  },
  body: JSON.stringify({
    title: 'Enterprise Software License',
    stage: 'Qualification',
    ownerId: 'your-user-id',
    amountCents: 10000000, // $100,000
    currency: 'AUD',
    status: 'OPEN',
    probability: 50,
    companyId: companyData.id,
    contactId: contactData.id,
    tags: ['enterprise', 'new-business']
  })
});

const dealData = await deal.json();

// 4. Create an activity
const activity = await fetch('http://localhost:4000/api/v1/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-workspace-id': 'your-workspace-id',
    'x-user-id': 'your-user-id'
  },
  body: JSON.stringify({
    type: 'MEETING',
    title: 'Initial Discovery Call',
    body: 'Discuss requirements and timeline',
    status: 'OPEN',
    priority: 'high',
    dueAt: '2024-02-01T14:00:00.000Z',
    ownerId: 'your-user-id',
    dealId: dealData.id,
    companyId: companyData.id,
    contactId: contactData.id
  })
});
```

---

### Example 2: Fetch Deal with Relations

```javascript
const deal = await fetch('http://localhost:4000/api/v1/deals/deal-id', {
  headers: {
    'x-workspace-id': 'your-workspace-id',
    'x-user-id': 'your-user-id'
  }
});

const dealData = await deal.json();

// dealData includes:
// - deal.company (company details)
// - deal.contact (contact details)
// - deal.owner (user details)
```

---

### Example 3: Update Deal Status

```javascript
// Mark deal as won
const response = await fetch('http://localhost:4000/api/v1/deals/deal-id', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-workspace-id': 'your-workspace-id',
    'x-user-id': 'your-user-id'
  },
  body: JSON.stringify({
    status: 'WON',
    stage: 'Closed Won',
    probability: 100
  })
});
```

---

### Example 4: React Hook for Fetching Companies

```typescript
import { useEffect, useState } from 'react';

const useCompanies = (workspaceId: string, userId: string) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/companies', {
          headers: {
            'x-workspace-id': workspaceId,
            'x-user-id': userId
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }

        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [workspaceId, userId]);

  return { companies, loading, error };
};
```

---

### Example 5: TypeScript Types

```typescript
// Copy these types to your frontend project

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  status?: string;
  email?: string;
  phone?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  workspaceId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  isPrimary?: boolean;
  leadSource?: string;
  companyId?: string;
  company?: Company;
  workspaceId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  stage: string;
  amountCents?: number;
  currency: string;
  status: 'OPEN' | 'WON' | 'LOST';
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  priority?: string;
  source?: string;
  tags?: string[];
  companyId?: string;
  contactId?: string;
  ownerId: string;
  company?: Company;
  contact?: Contact;
  owner?: User;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'NOTE' | 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';
  title: string;
  body?: string;
  status: 'OPEN' | 'DONE';
  priority?: string;
  dueAt?: string;
  ownerId: string;
  dealId?: string;
  companyId?: string;
  contactId?: string;
  owner?: User;
  deal?: Deal;
  company?: Company;
  contact?: Contact;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INVITED' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
}
```

---

## Rate Limiting

**Current Limit:** 100 requests per 15 minutes per IP address

**Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

**When Rate Limited (429):**
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later."
}
```

---

## CORS

**Allowed Origins:** Configured via `CORS_ORIGIN` environment variable

**Development:** All origins allowed (`*`)

**Production:** Set to specific frontend domain

---

## Best Practices

1. **Always Include Required Headers**
   - `x-workspace-id` and `x-user-id` are mandatory for all CRM endpoints

2. **Handle Soft Deletes**
   - Deleted records have `deletedAt` timestamp
   - Not returned in list endpoints by default

3. **Use UUIDs**
   - All IDs are UUIDs (v4)
   - Generate on frontend or let backend handle

4. **Currency Amounts**
   - Always stored as cents (integer)
   - Display: `amountCents / 100`
   - Example: 5000000 cents = $50,000.00

5. **Date Formats**
   - ISO 8601 format: `2024-01-15T10:30:00.000Z`
   - Always UTC timezone

6. **Error Handling**
   - Always check response status
   - Parse error messages from response body
   - Display validation errors per field

7. **Optimistic Updates**
   - Update UI immediately
   - Revert on error

---

## Questions or Issues?

Create an issue at: https://github.com/anthropics/claude-code/issues

---

**Last Updated:** 2024-01-29
**API Version:** v1
**Backend Version:** 1.0.0
