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
# ✅ Workspace created: [ID]
# ✅ Users created: [IDs]
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
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedBy?: string;
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
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  companyId?: string;
  company?: Company;
  workspaceId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Deal {
  id: string;
  title: string;
  stage: string;
  amountCents?: number;
  currency: string;
  status: DealStatus;
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
  deletedAt?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  body?: string;
  status: ActivityStatus;
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

export interface DashboardConfig {
  id: string;
  workspaceId: string;
  userId: string;
  theme?: string;
  layout?: any[];
  items?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Enums
// ============================================

export enum DealStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
}

export enum ActivityType {
  NOTE = 'NOTE',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  TASK = 'TASK',
}

export enum ActivityStatus {
  OPEN = 'OPEN',
  DONE = 'DONE',
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
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  companyId?: string;
  isPrimary?: boolean;
  leadSource?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export interface CreateDealRequest {
  title: string;
  stage: string;
  ownerId: string;
  amountCents?: number;
  currency?: string;
  status?: DealStatus;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  priority?: string;
  source?: string;
  tags?: string[];
  companyId?: string;
  contactId?: string;
}

export interface UpdateDealRequest extends Partial<CreateDealRequest> {}

export interface CreateActivityRequest {
  type: ActivityType;
  title: string;
  ownerId: string;
  body?: string;
  status?: ActivityStatus;
  priority?: string;
  dueAt?: string;
  dealId?: string;
  companyId?: string;
  contactId?: string;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {}

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
} from '@/types/api';

export const companiesService = {
  getAll: () => apiClient.get<Company[]>('/api/v1/companies'),

  getById: (id: string) => apiClient.get<Company>(`/api/v1/companies/${id}`),

  create: (data: CreateCompanyRequest) =>
    apiClient.post<Company>('/api/v1/companies', data),

  update: (id: string, data: UpdateCompanyRequest) =>
    apiClient.put<Company>(`/api/v1/companies/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/companies/${id}`),
};
```

### services/deals.ts

```typescript
import { apiClient } from './api';
import type { Deal, CreateDealRequest, UpdateDealRequest } from '@/types/api';

export const dealsService = {
  getAll: () => apiClient.get<Deal[]>('/api/v1/deals'),

  getById: (id: string) => apiClient.get<Deal>(`/api/v1/deals/${id}`),

  create: (data: CreateDealRequest) =>
    apiClient.post<Deal>('/api/v1/deals', data),

  update: (id: string, data: UpdateDealRequest) =>
    apiClient.patch<Deal>(`/api/v1/deals/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/v1/deals/${id}`),
};
```

### services/index.ts

```typescript
export * from './api';
export * from './companies';
export * from './deals';
// Export other services...
```

---

## React Hooks Examples

### hooks/useCompanies.ts

```typescript
import { useState, useEffect } from 'react';
import { companiesService } from '@/services';
import type { Company, ApiError } from '@/types/api';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await companiesService.getAll();
        setCompanies(data);
        setError(null);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getAll();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return { companies, loading, error, refetch };
};
```

### hooks/useCompany.ts

```typescript
import { useState, useEffect } from 'react';
import { companiesService } from '@/services';
import type { Company, ApiError } from '@/types/api';

export const useCompany = (id: string | undefined) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const data = await companiesService.getById(id);
        setCompany(data);
        setError(null);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  return { company, loading, error };
};
```

### hooks/useCreateCompany.ts

```typescript
import { useState } from 'react';
import { companiesService } from '@/services';
import type { Company, CreateCompanyRequest, ApiError } from '@/types/api';

export const useCreateCompany = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createCompany = async (
    data: CreateCompanyRequest
  ): Promise<Company | null> => {
    try {
      setLoading(true);
      setError(null);
      const company = await companiesService.create(data);
      return company;
    } catch (err) {
      setError(err as ApiError);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createCompany, loading, error };
};
```

### hooks/useDeals.ts

```typescript
import { useState, useEffect } from 'react';
import { dealsService } from '@/services';
import type { Deal, ApiError } from '@/types/api';

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const data = await dealsService.getAll();
        setDeals(data);
        setError(null);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await dealsService.getAll();
      setDeals(data);
      setError(null);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return { deals, loading, error, refetch };
};
```

---

## Error Handling

### components/ErrorBoundary.tsx

```typescript
import React, { Component, ReactNode } from 'react';
import type { ApiError } from '@/types/api';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }

      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

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

#### Example Component with React Query

```typescript
import { useCompaniesQuery, useCreateCompanyMutation } from '@/hooks/queries';

export const CompaniesList = () => {
  const { data: companies, isLoading, error } = useCompaniesQuery();
  const createMutation = useCreateCompanyMutation();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name: 'New Company',
      industry: 'Technology',
    });
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Company'}
      </button>

      <ul>
        {companies?.map((company) => (
          <li key={company.id}>{company.name}</li>
        ))}
      </ul>
    </div>
  );
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

### Example Test

```typescript
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { CompaniesList } from '@/components/CompaniesList';
import { companiesService } from '@/services';

jest.mock('@/services');

describe('CompaniesList', () => {
  it('should render companies', async () => {
    const mockCompanies = [
      { id: '1', name: 'Acme Corp', industry: 'Tech' },
      { id: '2', name: 'TechStart', industry: 'SaaS' },
    ];

    (companiesService.getAll as jest.Mock).mockResolvedValue(mockCompanies);

    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('TechStart')).toBeInTheDocument();
    });
  });

  it('should handle errors', async () => {
    (companiesService.getAll as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    renderWithProviders(<CompaniesList />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
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

// Example: formatDate('2024-01-15T10:30:00.000Z') => "Jan 15, 2024"

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

### 2. Use Optimistic Updates

```typescript
const updateMutation = useMutation({
  mutationFn: companiesService.update,
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['companies'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['companies']);

    // Optimistically update
    queryClient.setQueryData(['companies'], (old: Company[]) =>
      old.map((c) => (c.id === variables.id ? { ...c, ...variables.data } : c))
    );

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['companies'], context?.previous);
  },
});
```

### 3. Debounce Search Inputs

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const [search, setSearch] = useState('');
const debouncedSearch = useDebouncedValue(search, 500);

const { data } = useCompaniesQuery({
  search: debouncedSearch,
});
```

### 4. Type-Safe API Calls

Always use TypeScript types for requests and responses. Never use `any`.

### 5. Environment Validation

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

### Issue: Wrong Type Imports

**Error:** Type errors in components

**Solution:**
```typescript
// Use 'import type' for types
import type { Company } from '@/types/api';

// Regular import for functions
import { companiesService } from '@/services';
```

---

## Next Steps

1. ✅ Copy TypeScript types to your project
2. ✅ Set up API service layer
3. ✅ Create custom hooks or React Query hooks
4. ✅ Implement error handling
5. ✅ Add loading states
6. ✅ Test API integration
7. ✅ Build UI components

---

## Resources

- **Full API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Backend README:** [README.md](./README.md)
- **React Query Docs:** https://tanstack.com/query/latest
- **TypeScript Handbook:** https://www.typescriptlang.org/docs

---

**Questions?** Create an issue at: https://github.com/YOUR_USERNAME/analytics-dashboard-be/issues
