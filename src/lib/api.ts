/**
 * API Client for layR Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requiresWallet?: boolean; // Indicates if operation requires wallet connection
  message?: string; // Additional message for user
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API] Request failed:', error);
    return {
      success: false,
      error: 'Network error',
    };
  }
}

// User APIs
export interface UserProfile {
  _id: string;
  privyId: string;
  email: string;
  name: string;
  avatar?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterUserInput {
  privyId: string;
  email: string;
  name: string;
}

export interface RegisterUserResponse {
  userId: string;
  profile: UserProfile;
}

export const userApi = {
  register: (data: RegisterUserInput) =>
    request<RegisterUserResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (userId: string) =>
    request<UserProfile>(`/api/users/${userId}`),

  sync: (privyId: string, walletAddress: string, email?: string) =>
    request('/api/users/sync', {
      method: 'POST',
      body: JSON.stringify({ privyId, walletAddress, email }),
    }),

  getByWallet: (walletAddress: string) =>
    request(`/api/users/${walletAddress}`),
};

// Project APIs
export interface Project {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  ownerId: string;
  ownerWalletAddress?: string;
  ownerName: string;
  ownerAvatar?: string;
  demoPrice: number;
  downloadPrice: number;
  isPublished: boolean;
  isFeatured: boolean;
  technologies: string[];
  category: string;
  images: string[];
  previewImage?: string;
  zipFileUrl?: string;
  demoUrl?: string;
  stats: {
    likes: number;
    forks: number;
    downloads: number;
    views: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  userId: string;
  ownerName: string;
  ownerAvatar?: string;
  demoPrice?: number;
  downloadPrice?: number;
  technologies?: string[];
  category?: string;
  images?: string[];
  previewImage?: string;
  zipFileUrl?: string;
  demoUrl?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}

export const projectApi = {
  create: (data: CreateProjectInput) =>
    request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (params?: { page?: number; limit?: number; owner?: string; search?: string; category?: string; featured?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.owner) searchParams.set('owner', params.owner);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.featured) searchParams.set('featured', 'true');

    const query = searchParams.toString();
    return request<Project[]>(`/api/projects${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    request<Project>(`/api/projects/${id}`),

  getBySlug: (slug: string) =>
    request<Project>(`/api/projects/slug/${slug}`),

  update: (id: string, ownerWalletAddress: string, data: Partial<CreateProjectInput>) =>
    request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, ownerWalletAddress }),
    }),

  delete: (id: string, ownerWalletAddress: string) =>
    request(`/api/projects/${id}?owner=${ownerWalletAddress}`, {
      method: 'DELETE',
    }),
};

// Access APIs
export interface AccessCheck {
  hasViewAccess: boolean;
  hasDownloadAccess: boolean;
  isOwner: boolean;
}

export const accessApi = {
  check: (projectId: string, walletAddress: string) =>
    request<AccessCheck>(`/api/access/check?projectId=${projectId}&walletAddress=${walletAddress}`),

  grant: (projectId: string, walletAddress: string, accessType: 'view' | 'download', txHash?: string) =>
    request('/api/access/grant', {
      method: 'POST',
      body: JSON.stringify({ projectId, walletAddress, accessType, txHash }),
    }),

  getUserAccess: (walletAddress: string) =>
    request(`/api/access/user/${walletAddress}`),
};

// Transaction APIs
export interface Transaction {
  _id: string;
  walletAddress: string;
  projectId: string;
  amount: number;
  currency: string;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'view_purchase' | 'download_purchase';
  createdAt: string;
}

export const transactionApi = {
  create: (data: {
    walletAddress: string;
    projectId: string;
    amount: number;
    type: 'view_purchase' | 'download_purchase';
    currency?: string;
    txHash?: string;
  }) =>
    request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirm: (id: string, txHash?: string, blockNumber?: number) =>
    request<Transaction>(`/api/transactions/${id}/confirm`, {
      method: 'PUT',
      body: JSON.stringify({ txHash, blockNumber }),
    }),

  getUserTransactions: (walletAddress: string) =>
    request<Transaction[]>(`/api/transactions/user/${walletAddress}`),

  getProjectTransactions: (projectId: string) =>
    request<Transaction[]>(`/api/transactions/project/${projectId}`),
};

// Health check
export const healthCheck = () => request('/health');
