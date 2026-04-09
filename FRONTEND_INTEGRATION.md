# Frontend Integration Guide

Quick start guide for integrating your frontend with the Analytics Dashboard Backend API.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [API Configuration](#api-configuration)
3. [TypeScript Types](#typescript-types)
4. [API Service Layer](#api-service-layer)
5. [React Hooks Examples](#react-hooks-examples)
6. [Error Handling](#error-handling)
7. [State Management](#state-management)
8. [Testing](#testing)

---

## Quick Start

### 1. Set Environment Variables

Create `.env` or `.env.local` in your frontend project:

```bash
# React / Vite
VITE_API_URL=http://localhost:4000
VITE_WORKSPACE_ID=your-workspace-id-from-seed-data
VITE_USER_ID=your-user-id-from-seed-data

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WORKSPACE_ID=your-workspace-id
NEXT_PUBLIC_USER_ID=your-user-id
```

### 2. Get Workspace and User IDs

Run the backend seed script to get default IDs:

```bash
cd analytics-dashboard-be
npm run seed

# Output will show:
# ✓ Workspace created: [ID]
# ✓ Users created: [IDs]
```

Or query the database:

```sql
-- Get workspace ID
SELECT id, name FROM workspaces;

-- Get user ID
SELECT id, full_name, email FROM users;
```

### 3. Test API Connection

```bash
curl http://localhost:4000/health

# Expected: {"status":"ok","timestamp":"..."}
```

---

## API Configuration

### config/api.ts

```typescript
// Vite / React
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  workspaceId: import.meta.env.VITE_WORKSPACE_ID,
  userId: import.meta.env.VITE_USER_ID,
};

// Next.js
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  workspaceId: process.env.NEXT_PUBLIC_WORKSPACE_ID,
  userId: process.env.NEXT_PUBLIC_USER_ID,
};

// Helper to get headers
export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'x-workspace-id': API_CONFIG.workspaceId,
  'x-user-id': API_CONFIG.userId,
});
```

---

## TypeScript Types

### types/api.ts

```typescript
// ============================================
// Core Entities
// ============================================

/** Resolved user summary — returned alongside UUID fields in all API responses */
export interface UserSummary {
  id: string;
  fullName: string;
}

export interface Company {
  id: string;
  // Required fields
  name: string;
  email: string;
  phone: string;          // max 30 chars
  website: string;
  industry: Industry;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;     // max 20 chars
  leadSource: LeadSource;
  status: CompanyStatus;
  // Optional fields
  companySize?: CompanySize;
  numberOfEmployees?: number;
  annualRevenue?: number;
  linkedinUrl?: string;
  timezone?: string;
  description?: string;
  lastActivityAt?: string;
  // System / audit
  workspaceId: string;
  ownerId?: string;
  owner?: UserSummary;            // resolved from ownerId
  createdBy?: string;
  createdByUser?: UserSummary;    // resolved from createdBy
  updatedBy?: string;
  updatedByUser?: UserSummary;    // resolved from updatedBy
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Contact {
  id: string;
  // Required fields
  name: string;
  email: string;
  // Contact details
  phone?: string;         // max 30 chars
  mobile?: string;        // max 30 chars
  jobTitle?: string;
  department?: string;
  linkedinUrl?: string;
  // Status / preferences
  status: ContactStatus;
  leadSource?: LeadSource;
  preferredContactMethod?: PreferredContactMethod;
  isPrimary: boolean;
  doNotContact: boolean;
  // Relations
  companyId: string;
  company?: Company;
  // Assignment
  assignedTo: string;
  assignedUser?: UserSummary;     // resolved from assignedTo
  ownerId?: string;
  owner?: UserSummary;            // resolved from ownerId
  // Tracking
  lastActivityAt?: string;
  // System / audit
  workspaceId: string;
  createdBy?: string;
  createdByUser?: UserSummary;    // resolved from createdBy
  updatedBy?: string;
  updatedByUser?: UserSummary;    // resolved from updatedBy
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Deal {
  id: string;
  // Required fields
  title: string;
  dealValue: number;      // integer, cents
  currency: string;
  status: DealStatus;
  stage: DealStage;
  priority: DealPriority;
  // Optional fields
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  lostReason?: DealLostReason;
  source?: LeadSource;
  description?: string;
  // Relations
  companyId: string;
  company?: Company;
  contactId?: string;
  contact?: Contact;
  // Assignment
  assignedTo: string;
  assignedUser?: UserSummary;     // resolved from assignedTo
  ownerId?: string;
  owner?: UserSummary;            // resolved from ownerId
  // System / audit
  workspaceId: string;
  createdBy?: string;
  createdByUser?: UserSummary;    // resolved from createdBy
  updatedBy?: string;
  updatedByUser?: UserSummary;    // resolved from updatedBy
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Activity {
  id: string;
  // Required fields
  type: ActivityType;
  subject: string;        // max 200 chars
  body?: string;
  priority: ActivityPriority;
  status: ActivityStatus;
  // Optional fields
  outcome?: ActivityOutcome;
  // Scheduling
  dueDate: string;        // YYYY-MM-DD
  dueTime: string;        // HH:MM
  reminderAt?: string;
  location?: string;
  duration?: number;
  // Relations
  contactId: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  companyId?: string;
  company?: Company;
  // Assignment
  assignedTo: string;
  assignedUser?: UserSummary;     // resolved from assignedTo
  ownerId?: string;
  owner?: UserSummary;            // resolved from ownerId
  // System / audit
  workspaceId: string;
  createdBy?: string;
  createdByUser?: UserSummary;    // resolved from createdBy
  updatedBy?: string;
  updatedByUser?: UserSummary;    // resolved from updatedBy
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface User {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  status: UserStatus;
  externalAuthId?: string;
  externalAuthProvider?: string;
  createdAt: string;
  updatedAt: string;
  workspaces?: WorkspaceMember[];
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}

export interface WidgetLayout {
  x: number;   // grid column (0-based)
  y: number;   // grid row (0-based)
  w: number;   // width in columns (2–12)
  h: number;   // height in rows (2–8)
}

export interface WidgetChartConfig {
  chartType?: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'funnel' | 'table';
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  showLegend?: boolean;
  showGrid?: boolean;
  showArea?: boolean;
  stacked?: boolean;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  dataSource: string;       // API path this widget fetches from
  layout: WidgetLayout;
  chartConfig: WidgetChartConfig;
  refreshInterval?: number; // ms, default 300000 (5 min)
}

export interface DashboardConfig {
  _id: string;
  userId: string;
  workspaceId: string;
  theme: 'light' | 'dark';
  gridCols: number;         // always 12
  rowHeight: number;        // always 80
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Report Response Types
// ============================================

export interface KpiSummary {
  totalPipeline: number;        // cents
  activeContacts: number;
  dealsWonThisMonth: { count: number; value: number };
  activitiesThisWeek: number;
}

export interface ReportParam {
  name: string;
  type: 'number' | 'string';
  default: string | number;
  description: string;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  category: 'overview' | 'deals' | 'activities' | 'contacts' | 'companies';
  widgetType: string;
  params?: ReportParam[];
}

export interface ReportCatalogResponse {
  total: number;
  data: ReportDefinition[];
}

export interface PipelineFunnelRow {
  stage: string;
  count: number;
  totalValue: number;
  conversionRate: number | null;
}

export interface RevenueForecastRow {
  month: string;      // YYYY-MM
  expectedRevenue: number;
  dealCount: number;
}

export interface WinLossMonthRow {
  month: string;
  won: number;
  lost: number;
  wonValue: number;
  lostValue: number;
}

export interface WinLossResponse {
  summary: { won: number; lost: number; winRate: number };
  monthly: WinLossMonthRow[];
  lostReasons: Array<{ reason: string; count: number }>;
}

export interface ValueDistributionRow {
  bucket: string;
  count: number;
  totalValue: number;
}

export interface TopDeal {
  id: string;
  title: string;
  dealValue: number;
  status: DealStatus;
  stage: DealStage;
  companyName: string;
  assignedToName: string;
  expectedCloseDate: string | null;
}

export interface ActivityByUserRow {
  userName: string;
  activities: Partial<Record<ActivityType, number>>;
  total: number;
}

export interface ContactGrowthRow {
  month: string;
  newContacts: number;
  cumulative: number;
}

export interface IndustryRow {
  industry: Industry;
  count: number;
  percentage: number;
}

// ============================================
// Enums
// ============================================

export enum DealStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
}

export enum DealStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed-won',
  CLOSED_LOST = 'closed-lost',
}

export enum DealPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DealLostReason {
  PRICE = 'price',
  COMPETITION = 'competition',
  TIMING = 'timing',
  NO_BUDGET = 'no-budget',
  NO_DECISION = 'no-decision',
  PRODUCT_FIT = 'product-fit',
  OTHER = 'other',
}

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  TASK = 'task',
  NOTE = 'note',
  DEADLINE = 'deadline',
}

export enum ActivityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ActivityStatus {
  OPEN = 'OPEN',
  DONE = 'DONE',
}

export enum ActivityOutcome {
  COMPLETED = 'completed',
  NO_ANSWER = 'no-answer',
  LEFT_VOICEMAIL = 'left-voicemail',
  RESCHEDULED = 'rescheduled',
}

export enum Industry {
  TECHNOLOGY = 'technology',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  EDUCATION = 'education',
  REAL_ESTATE = 'real-estate',
}

export enum CompanySize {
  SIZE_1_10 = '1-10',
  SIZE_11_50 = '11-50',
  SIZE_51_200 = '51-200',
  SIZE_201_500 = '201-500',
  SIZE_501_1000 = '501-1000',
  SIZE_1000_PLUS = '1000+',
}

export enum LeadSource {
  WEBSITE = 'website',
  REFERRAL = 'referral',
  COLD_CALL = 'cold-call',
  SOCIAL_MEDIA = 'social-media',
  EVENT = 'event',
  PARTNER = 'partner',
  ADVERTISING = 'advertising',
  OTHER = 'other',
}

export enum CompanyStatus {
  PROSPECT = 'prospect',
  ACTIVE = 'active',
  CHURNED = 'churned',
  INACTIVE = 'inactive',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BOUNCED = 'bounced',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum PreferredContactMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  MOBILE = 'mobile',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  DISABLED = 'DISABLED',
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateCompanyRequest {
  // Required fields
  name: string;
  email: string;
  phone: string;
  website: string;
  industry: Industry;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;     // renamed from postcode
  leadSource: LeadSource;
  // Optional fields
  status?: CompanyStatus;
  companySize?: CompanySize;
  numberOfEmployees?: number;
  annualRevenue?: number;
  linkedinUrl?: string;
  timezone?: string;
  description?: string;
  ownerId?: string;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface CreateContactRequest {
  // Required fields
  name: string;
  email: string;
  companyId: string;
  assignedTo: string;
  // Optional fields
  phone?: string;         // max 30 chars
  mobile?: string;        // max 30 chars
  jobTitle?: string;
  department?: string;
  linkedinUrl?: string;
  status?: ContactStatus;
  leadSource?: LeadSource;
  preferredContactMethod?: PreferredContactMethod;
  isPrimary?: boolean;
  doNotContact?: boolean;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export interface CreateDealRequest {
  // Required fields
  title: string;
  dealValue: number;      // integer, cents
  stage: DealStage;
  priority: DealPriority;
  companyId: string;
  assignedTo: string;
  // Optional fields
  currency?: string;
  status?: DealStatus;
  contactId?: string;
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  lostReason?: DealLostReason;  // required when status = LOST
  source?: LeadSource;
  description?: string;
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {
  contactId?: string | null;  // can be set to null to disassociate
}

export interface CreateActivityRequest {
  // Required fields
  type: ActivityType;
  subject: string;        // max 200 chars
  priority: ActivityPriority;
  dueDate: string;        // YYYY-MM-DD
  dueTime: string;        // HH:MM or HH:MM:SS
  contactId: string;
  assignedTo: string;
  // Optional fields
  body?: string;
  status?: ActivityStatus;
  outcome?: ActivityOutcome;
  reminderAt?: string;    // ISO datetime
  location?: string;
  duration?: number;
  dealId?: string;
  companyId?: string;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  dealId?: string | null;     // can be set to null
  companyId?: string | null;  // can be set to null
}

export interface CreateUserRequest {
  fullName: string;
  email?: string;
  avatarUrl?: string;
  externalAuthId?: string;
  externalAuthProvider?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{
    field?: string;
    path?: string[];
    message: string;
  }>;
}

// ============================================
// Utility Types
// ============================================

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query parameters for list endpoints
export interface ListQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20
  search?: string;      // Search term
  sortBy?: string;      // Field to sort by (entity-specific)
  sortOrder?: 'ASC' | 'DESC';  // Default: DESC
}
```

---

## API Service Layer

### services/api.ts

```typescript
import { API_CONFIG, getApiHeaders } from '@/config/api';
import type { ApiError } from '@/types/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...getApiHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          statusCode: response.status,
          message: data.message || 'An error occurred',
          errors: data.errors,
        };
        throw error;
      }

      return data as T;
    } catch (error) {
      // Re-throw ApiError as is
      if ((error as ApiError).statusCode) {
        throw error;
      }

      // Network or other errors
      throw {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Network error',
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_CONFIG.baseURL);
```

### services/companies.ts

```typescript
import { apiClient } from './api';
import type {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  PaginatedResponse,
  ListQueryParams,
} from '@/types/api';

const buildQueryString = (params: ListQueryParams): string => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const companiesService = {
  getAll: (params: ListQueryParams = {}) =>
    apiClient.get<PaginatedResponse<Company>>(
      `/api/v1/companies${buildQueryString(params)}`
    ),

  getById: (id: string) => apiClient.get<Company>(`/api/v1/companies/${id}`),

  create: (data: CreateCompanyRequest) =>
    apiClient.post<Company>('/api/v1/companies', data),

  update: (id: string, data: UpdateCompanyRequest) =>
    apiClient.patch<Company>(`/api/v1/companies/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/companies/${id}`),
};
```

### services/contacts.ts

```typescript
import { apiClient } from './api';
import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  PaginatedResponse,
  ListQueryParams,
} from '@/types/api';

export const contactsService = {
  getAll: (params: ListQueryParams = {}) =>
    apiClient.get<PaginatedResponse<Contact>>(
      `/api/v1/contacts${buildQueryString(params)}`
    ),

  getById: (id: string) => apiClient.get<Contact>(`/api/v1/contacts/${id}`),

  create: (data: CreateContactRequest) =>
    apiClient.post<Contact>('/api/v1/contacts', data),

  update: (id: string, data: UpdateContactRequest) =>
    apiClient.patch<Contact>(`/api/v1/contacts/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/contacts/${id}`),
};
```

### services/deals.ts

```typescript
import { apiClient } from './api';
import type {
  Deal,
  CreateDealRequest,
  UpdateDealRequest,
  PaginatedResponse,
  ListQueryParams,
} from '@/types/api';

export const dealsService = {
  getAll: (params: ListQueryParams = {}) =>
    apiClient.get<PaginatedResponse<Deal>>(
      `/api/v1/deals${buildQueryString(params)}`
    ),

  getById: (id: string) => apiClient.get<Deal>(`/api/v1/deals/${id}`),

  create: (data: CreateDealRequest) =>
    apiClient.post<Deal>('/api/v1/deals', data),

  update: (id: string, data: UpdateDealRequest) =>
    apiClient.patch<Deal>(`/api/v1/deals/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/deals/${id}`),
};
```

### services/activities.ts

```typescript
import { apiClient } from './api';
import type {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  PaginatedResponse,
  ListQueryParams,
} from '@/types/api';

export const activitiesService = {
  getAll: (params: ListQueryParams = {}) =>
    apiClient.get<PaginatedResponse<Activity>>(
      `/api/v1/activities${buildQueryString(params)}`
    ),

  getById: (id: string) => apiClient.get<Activity>(`/api/v1/activities/${id}`),

  create: (data: CreateActivityRequest) =>
    apiClient.post<Activity>('/api/v1/activities', data),

  update: (id: string, data: UpdateActivityRequest) =>
    apiClient.patch<Activity>(`/api/v1/activities/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/activities/${id}`),
};
```

### services/reports.ts

```typescript
import { apiClient } from './api';
import type {
  ReportCatalogResponse,
  KpiSummary,
  PipelineFunnelRow,
  RevenueForecastRow,
  WinLossResponse,
  ValueDistributionRow,
  TopDeal,
  ActivityByUserRow,
  ContactGrowthRow,
  IndustryRow,
} from '@/types/api';

export const reportsService = {
  // Catalog — discover all available reports
  getCatalog: () =>
    apiClient.get<ReportCatalogResponse>('/api/v1/reports'),

  // Overview
  getKpiSummary: () =>
    apiClient.get<KpiSummary>('/api/v1/reports/kpi-summary'),

  // Deals
  getPipelineFunnel: () =>
    apiClient.get<{ data: PipelineFunnelRow[] }>('/api/v1/deals/reports/pipeline-funnel'),

  getRevenueForecast: (months = 6) =>
    apiClient.get<{ data: RevenueForecastRow[] }>(
      `/api/v1/deals/reports/revenue-forecast?months=${months}`
    ),

  getWinLoss: (period: '3m' | '6m' | '12m' | 'ytd' = '12m') =>
    apiClient.get<WinLossResponse>(`/api/v1/deals/reports/win-loss?period=${period}`),

  getValueDistribution: () =>
    apiClient.get<{ data: ValueDistributionRow[] }>('/api/v1/deals/reports/value-distribution'),

  getTopDeals: (limit = 10) =>
    apiClient.get<{ data: TopDeal[] }>(`/api/v1/deals/reports/top-deals?limit=${limit}`),

  getDealsByStage: () =>
    apiClient.get<{ data: Array<{ stage: string; count: string; totalValue: string }> }>(
      '/api/v1/deals/reports/by-stage'
    ),

  getDealsByMonth: () =>
    apiClient.get<{ data: Array<{ month: string; count: string; totalValue: string }> }>(
      '/api/v1/deals/reports/by-month'
    ),

  // Activities
  getActivitiesByType: () =>
    apiClient.get<{ data: Array<{ type: string; count: string }> }>(
      '/api/v1/activities/reports/by-type'
    ),

  getActivitiesByUser: () =>
    apiClient.get<{ data: ActivityByUserRow[] }>('/api/v1/activities/reports/by-user'),

  // Contacts
  getContactGrowth: () =>
    apiClient.get<{ data: ContactGrowthRow[] }>('/api/v1/contacts/reports/growth'),

  // Companies
  getCompaniesByIndustry: () =>
    apiClient.get<{ data: IndustryRow[] }>('/api/v1/companies/reports/by-industry'),
};
```

### services/bootstrap.ts

```typescript
import { apiClient } from './api';
import type { DashboardConfig, DashboardWidget } from '@/types/api';

export const bootstrapService = {
  // Get or create dashboard config for the current user
  get: () =>
    apiClient.get<DashboardConfig>('/api/v1/bootstrap'),

  // Update theme and/or widget layout
  update: (payload: { theme?: 'light' | 'dark'; widgets?: DashboardWidget[] }) =>
    apiClient.put<DashboardConfig>('/api/v1/bootstrap', payload),
};
```

### services/index.ts

```typescript
export * from './api';
export * from './companies';
export * from './contacts';
export * from './deals';
export * from './activities';
export * from './reports';
export * from './bootstrap';
```

---

## React Hooks Examples

### hooks/useCompanies.ts

```typescript
import { useState, useEffect, useCallback } from 'react';
import { companiesService } from '@/services';
import type { Company, ApiError, ListQueryParams, PaginatedResponse } from '@/types/api';

export const useCompanies = (initialParams: ListQueryParams = {}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [params, setParams] = useState<ListQueryParams>(initialParams);

  const fetchCompanies = useCallback(async (queryParams: ListQueryParams) => {
    try {
      setLoading(true);
      const response = await companiesService.getAll(queryParams);
      setCompanies(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies(params);
  }, [params, fetchCompanies]);

  const refetch = () => fetchCompanies(params);

  const setPage = (page: number) => setParams((prev) => ({ ...prev, page }));
  const setLimit = (limit: number) => setParams((prev) => ({ ...prev, limit, page: 1 }));
  const setSearch = (search: string) => setParams((prev) => ({ ...prev, search, page: 1 }));

  return { companies, pagination, loading, error, refetch, setPage, setLimit, setSearch };
};
```

### hooks/useDeals.ts

```typescript
import { useState, useEffect, useCallback } from 'react';
import { dealsService } from '@/services';
import type { Deal, ApiError, ListQueryParams } from '@/types/api';

export const useDeals = (initialParams: ListQueryParams = {}) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [params, setParams] = useState<ListQueryParams>(initialParams);

  const fetchDeals = useCallback(async (queryParams: ListQueryParams) => {
    try {
      setLoading(true);
      const response = await dealsService.getAll(queryParams);
      setDeals(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals(params);
  }, [params, fetchDeals]);

  const refetch = () => fetchDeals(params);

  const setPage = (page: number) => setParams((prev) => ({ ...prev, page }));
  const setLimit = (limit: number) => setParams((prev) => ({ ...prev, limit, page: 1 }));
  const setSearch = (search: string) => setParams((prev) => ({ ...prev, search, page: 1 }));

  return { deals, pagination, loading, error, refetch, setPage, setLimit, setSearch };
};
```

### hooks/queries/useReportsQuery.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { reportsService, bootstrapService } from '@/services';

// Report catalog — load once, rarely changes
export const useReportCatalog = () =>
  useQuery({
    queryKey: ['reports', 'catalog'],
    queryFn: reportsService.getCatalog,
    staleTime: Infinity,
  });

// KPI summary — refresh every 5 minutes
export const useKpiSummary = () =>
  useQuery({
    queryKey: ['reports', 'kpi-summary'],
    queryFn: reportsService.getKpiSummary,
    refetchInterval: 5 * 60 * 1000,
  });

export const usePipelineFunnel = () =>
  useQuery({
    queryKey: ['reports', 'pipeline-funnel'],
    queryFn: reportsService.getPipelineFunnel,
  });

export const useRevenueForecast = (months = 6) =>
  useQuery({
    queryKey: ['reports', 'revenue-forecast', months],
    queryFn: () => reportsService.getRevenueForecast(months),
  });

export const useWinLoss = (period: '3m' | '6m' | '12m' | 'ytd' = '12m') =>
  useQuery({
    queryKey: ['reports', 'win-loss', period],
    queryFn: () => reportsService.getWinLoss(period),
  });

export const useTopDeals = (limit = 10) =>
  useQuery({
    queryKey: ['reports', 'top-deals', limit],
    queryFn: () => reportsService.getTopDeals(limit),
  });

export const useContactGrowth = () =>
  useQuery({
    queryKey: ['reports', 'contact-growth'],
    queryFn: reportsService.getContactGrowth,
  });

export const useCompaniesByIndustry = () =>
  useQuery({
    queryKey: ['reports', 'companies-by-industry'],
    queryFn: reportsService.getCompaniesByIndustry,
  });

// Dashboard config
export const useBootstrap = () =>
  useQuery({
    queryKey: ['bootstrap'],
    queryFn: bootstrapService.get,
  });
```

---

## Error Handling

### utils/errorHandling.ts

```typescript
import type { ApiError } from '@/types/api';

export const formatApiError = (error: ApiError): string => {
  if (error.errors && error.errors.length > 0) {
    return error.errors.map((e) => e.message).join(', ');
  }
  return error.message;
};

export const getFieldError = (
  error: ApiError | null,
  fieldName: string
): string | undefined => {
  if (!error?.errors) return undefined;
  const fieldError = error.errors.find(
    (e) => e.field === fieldName || e.path?.includes(fieldName)
  );
  return fieldError?.message;
};
```

---

## State Management

### React Query (Recommended)

```bash
npm install @tanstack/react-query
```

#### setup/queryClient.ts

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

#### hooks/queries/useCompaniesQuery.ts

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesService } from '@/services';
import type { CreateCompanyRequest, UpdateCompanyRequest } from '@/types/api';

export const useCompaniesQuery = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: companiesService.getAll,
  });
};

export const useCompanyQuery = (id: string) => {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => companiesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};

export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyRequest }) =>
      companiesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', variables.id] });
    },
  });
};

export const useDeleteCompanyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
};
```

---

## Testing

### setup/test-utils.tsx

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderOptions
) => {
  const testQueryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};
```

---

## Utility Functions

### utils/currency.ts

```typescript
export const formatCurrency = (amountCents: number, currency = 'AUD'): string => {
  const amount = amountCents / 100;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Example: formatCurrency(5000000, 'AUD') => "$50,000.00"
```

### utils/date.ts

```typescript
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};
```

---

## Best Practices

### 1. Always Handle Loading States

```typescript
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;
```

### 2. Debounce Search Inputs

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 500);

const { data } = useCompaniesQuery({
  search: debouncedSearch,
});
```

### 3. Type-Safe API Calls

Always use TypeScript types for requests and responses. Never use `any`.

### 4. Environment Validation

Validate environment variables at app startup:

```typescript
const requiredEnvVars = ['VITE_API_URL', 'VITE_WORKSPACE_ID', 'VITE_USER_ID'];

requiredEnvVars.forEach((varName) => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

---

## Common Issues & Solutions

### Issue: CORS Error

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
1. Ensure backend CORS_ORIGIN includes your frontend URL
2. Check headers are properly set
3. Verify API is running

### Issue: Headers Not Sent

**Error:** `x-workspace-id header is required`

**Solution:**
```typescript
// Make sure getApiHeaders() is called in every request
const headers = {
  ...getApiHeaders(), // Important!
  ...options.headers,
};
```

### Issue: postalCode field not accepted

**Error:** Validation fails on company create/update

**Solution:** Use `postalCode` (camelCase) — the field was renamed from `postcode`.

```typescript
// Correct
const company = { postalCode: '2000', ... };

// Wrong - will fail validation
const company = { postcode: '2000', ... };
```

---

## Next Steps

1. Copy TypeScript types to your project
2. Set up API service layer
3. Create custom hooks or React Query hooks
4. Implement error handling
5. Add loading states
6. Test API integration
7. Build UI components

---

## Resources

- **Full API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Backend README:** [README.md](./README.md)
- **React Query Docs:** https://tanstack.com/query/latest
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
