import { usePrivy, User as PrivyUser } from '@privy-io/react-auth';
import { useUser } from '@/contexts/UserContext';
import { UserProfile } from '@/lib/api';

/**
 * Return type for the useAuth hook
 */
export interface UseAuthReturn {
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether Privy is still initializing */
  isLoading: boolean;
  /** Whether Privy has finished initializing and auth state is reliable */
  ready: boolean;
  /** The authenticated Privy user object, or null if not authenticated */
  user: PrivyUser | null;
  /** The user's profile from the database, or null if not registered */
  userProfile: UserProfile | null;
  /** The user's ID from the database, or null if not registered */
  userId: string | null;
  /** Whether the user is being registered in the database */
  isRegistering: boolean;
  /** Function to trigger the Privy login modal */
  login: () => void;
  /** Function to log out the current user */
  logout: () => Promise<void>;
}

/**
 * Custom authentication hook that wraps Privy's usePrivy hook.
 * Provides access to authentication state and the user's profile information.
 * 
 * @returns {UseAuthReturn} Authentication state and methods
 * 
 * @example
 * ```tsx
 * const { isAuthenticated, userProfile, userId, login, logout } = useAuth();
 * 
 * if (isAuthenticated && userId) {
 *   console.log('User ID:', userId);
 *   console.log('Profile:', userProfile);
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const { ready, authenticated, user, login, logout: privyLogout } = usePrivy();
  const { userId, userProfile, isRegistering, clearUser } = useUser();

  // Enhanced logout that clears both Privy and user data
  const logout = async () => {
    clearUser();
    await privyLogout();
  };

  return {
    isAuthenticated: authenticated,
    isLoading: !ready,
    ready,
    user: user ?? null,
    userProfile,
    userId,
    isRegistering,
    login,
    logout,
  };
}

export default useAuth;
