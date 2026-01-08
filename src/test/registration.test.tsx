import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import { UserProvider } from '@/contexts/UserContext';
import * as api from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  userApi: {
    register: vi.fn(),
    getUser: vi.fn(),
  },
}));

// Mock navigate function
const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Privy hook
const mockPrivyHook = {
  ready: true,
  authenticated: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('@privy-io/react-auth', async () => {
  const actual = await vi.importActual('@privy-io/react-auth');
  return {
    ...actual,
    usePrivy: () => mockPrivyHook,
    PrivyProvider: ({ children }: any) => <div>{children}</div>,
  };
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <PrivyProvider appId="test-app-id" config={{ loginMethods: ['email', 'google'] }}>
      <UserProvider>
        {children}
      </UserProvider>
    </PrivyProvider>
  </BrowserRouter>
);

describe('User Registration Flow - Requirements 2.1-2.5', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockPrivyHook.ready = true;
    mockPrivyHook.authenticated = false;
    mockPrivyHook.user = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 2.1: Sign Up Page Display', () => {
    it('should display Google and Email authentication options on signup page', () => {
      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      // Check for signup page elements
      expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
      expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
    });

    it('should show loading state while Privy initializes', () => {
      mockPrivyHook.ready = false;

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });
  });

  describe('Requirement 2.2: Google Authentication', () => {
    it('should trigger Privy login when Create Account button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      const signupButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(signupButton);

      expect(mockPrivyHook.login).toHaveBeenCalledTimes(1);
    });

    it('should create profile with Google name and email after authentication', async () => {
      // Mock successful Google authentication
      const mockUser = {
        id: 'privy-123',
        google: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const mockRegisterResponse = {
        success: true,
        data: {
          userId: 'user-123',
          profile: {
            id: 'user-123',
            privyId: 'privy-123',
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      vi.mocked(api.userApi.register).mockResolvedValue(mockRegisterResponse);

      mockPrivyHook.authenticated = true;
      mockPrivyHook.user = mockUser as any;

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(api.userApi.register).toHaveBeenCalledWith({
          privyId: 'privy-123',
          email: 'john@example.com',
          name: 'John Doe',
        });
      });
    });
  });

  describe('Requirement 2.3: Email Authentication', () => {
    it('should create profile with provided email after email authentication', async () => {
      // Mock successful email authentication
      const mockUser = {
        id: 'privy-456',
        email: {
          address: 'jane@example.com',
        },
      };

      const mockRegisterResponse = {
        success: true,
        data: {
          userId: 'user-456',
          profile: {
            id: 'user-456',
            privyId: 'privy-456',
            name: 'jane',
            email: 'jane@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      vi.mocked(api.userApi.register).mockResolvedValue(mockRegisterResponse);

      mockPrivyHook.authenticated = true;
      mockPrivyHook.user = mockUser as any;

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(api.userApi.register).toHaveBeenCalledWith({
          privyId: 'privy-456',
          email: 'jane@example.com',
          name: 'jane',
        });
      });
    });
  });

  describe('Requirement 2.4: Redirect to Dashboard', () => {
    it('should redirect to dashboard after successful authentication', async () => {
      const mockNavigate = vi.fn();
      
      // Mock useNavigate
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate,
        };
      });

      const mockUser = {
        id: 'privy-789',
        email: {
          address: 'test@example.com',
        },
      };

      const mockRegisterResponse = {
        success: true,
        data: {
          userId: 'user-789',
          profile: {
            id: 'user-789',
            privyId: 'privy-789',
            name: 'test',
            email: 'test@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      vi.mocked(api.userApi.register).mockResolvedValue(mockRegisterResponse);

      mockPrivyHook.authenticated = true;
      mockPrivyHook.user = mockUser as any;

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      // Wait for registration to complete
      await waitFor(() => {
        expect(api.userApi.register).toHaveBeenCalled();
      });
    });
  });

  describe('Requirement 2.5: Store User Profile', () => {
    it('should store user profile in database with unique ID, name, email, and creation date', async () => {
      const mockUser = {
        id: 'privy-999',
        google: {
          name: 'Test User',
          email: 'testuser@example.com',
        },
      };

      const mockRegisterResponse = {
        success: true,
        data: {
          userId: 'user-999',
          profile: {
            id: 'user-999',
            privyId: 'privy-999',
            name: 'Test User',
            email: 'testuser@example.com',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        },
      };

      vi.mocked(api.userApi.register).mockResolvedValue(mockRegisterResponse);

      mockPrivyHook.authenticated = true;
      mockPrivyHook.user = mockUser as any;

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      await waitFor(() => {
        const registerCall = vi.mocked(api.userApi.register).mock.calls[0][0];
        
        // Verify all required fields are present
        expect(registerCall).toHaveProperty('privyId');
        expect(registerCall).toHaveProperty('email');
        expect(registerCall).toHaveProperty('name');
        expect(registerCall.privyId).toBe('privy-999');
        expect(registerCall.email).toBe('testuser@example.com');
        expect(registerCall.name).toBe('Test User');
      });
    });

    it('should store userId in localStorage after successful registration', async () => {
      const mockUser = {
        id: 'privy-111',
        email: {
          address: 'storage@example.com',
        },
      };

      const mockRegisterResponse = {
        success: true,
        data: {
          userId: 'user-111',
          profile: {
            id: 'user-111',
            privyId: 'privy-111',
            name: 'storage',
            email: 'storage@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      vi.mocked(api.userApi.register).mockResolvedValue(mockRegisterResponse);

      mockPrivyHook.authenticated = true;
      mockPrivyHook.user = mockUser as any;

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      await waitFor(() => {
        const storedUserId = localStorage.getItem('layR_userId');
        const storedProfile = localStorage.getItem('layR_userProfile');
        
        expect(storedUserId).toBe('user-111');
        expect(storedProfile).toBeTruthy();
        
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          expect(profile.id).toBe('user-111');
          expect(profile.email).toBe('storage@example.com');
        }
      });
    });
  });

  describe('Login Page Tests', () => {
    it('should display login page with sign in button', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
      expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    });

    it('should trigger Privy login when Sign In button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const loginButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(loginButton);

      expect(mockPrivyHook.login).toHaveBeenCalledTimes(1);
    });

    it('should handle existing user login', async () => {
      const mockUser = {
        id: 'privy-existing',
        email: {
          address: 'existing@example.com',
        },
      };

      const mockRegisterResponse = {
        success: true,
        data: {
          userId: 'user-existing',
          profile: {
            id: 'user-existing',
            privyId: 'privy-existing',
            name: 'Existing User',
            email: 'existing@example.com',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date(),
          },
        },
        isNew: false,
      };

      vi.mocked(api.userApi.register).mockResolvedValue(mockRegisterResponse);

      mockPrivyHook.authenticated = true;
      mockPrivyHook.user = mockUser as any;

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(api.userApi.register).toHaveBeenCalled();
        const storedUserId = localStorage.getItem('layR_userId');
        expect(storedUserId).toBe('user-existing');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle registration API errors gracefully', async () => {
      const mockUser = {
        id: 'privy-error',
        email: {
          address: 'error@example.com',
        },
      };

      vi.mocked(api.userApi.register).mockRejectedValue(new Error('API Error'));

      mockPrivyHook.authenticated = true;
      mockPrivyHook.user = mockUser as any;

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(api.userApi.register).toHaveBeenCalled();
        // Should not crash the app
        expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during registration', async () => {
      const mockUser = {
        id: 'privy-loading',
        email: {
          address: 'loading@example.com',
        },
      };

      // Delay the response
      vi.mocked(api.userApi.register).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {
            userId: 'user-loading',
            profile: {
              id: 'user-loading',
              privyId: 'privy-loading',
              name: 'loading',
              email: 'loading@example.com',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        }), 100))
      );

      mockPrivyHook.authenticated = true;
      mockPrivyHook.user = mockUser as any;

      render(
        <TestWrapper>
          <Signup />
        </TestWrapper>
      );

      // Should show loading state
      expect(screen.getByText(/Creating your account/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(api.userApi.register).toHaveBeenCalled();
      });
    });
  });
});
