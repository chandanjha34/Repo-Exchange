import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { userApi, UserProfile } from '@/lib/api';

interface UserContextType {
  userId: string | null;
  userProfile: UserProfile | null;
  isRegistering: boolean;
  registerUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, logout } = usePrivy();
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Load userId from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('layR_userId');
    const storedProfile = localStorage.getItem('layR_userProfile');

    if (storedUserId) {
      setUserId(storedUserId);
    }

    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error('Failed to parse stored user profile:', error);
      }
    }
  }, []);

  // Register user after Privy authentication
  const registerUser = async () => {
    if (!user || !authenticated) {
      console.error('Cannot register: user not authenticated');
      return;
    }

    setIsRegistering(true);

    try {
      // Extract user info from Privy
      const privyId = user.id;
      const email = user.email?.address || user.google?.email || '';
      const name = user.google?.name || user.email?.address?.split('@')[0] || 'User';

      console.log('[UserContext] Registering user:', { privyId, email, name });

      // Call backend to register user
      const response = await userApi.register({
        privyId,
        email,
        name,
      });

      console.log('[UserContext] Registration response:', response);

      if (response.success && response.data) {
        const { userId: newUserId, profile } = response.data;

        console.log('[UserContext] Registration successful:', newUserId);

        // Store in state - use the profile from backend to ensure consistency
        setUserId(newUserId);
        setUserProfile(profile);

        // Store in localStorage - this preserves profile across refreshes
        localStorage.setItem('layR_userId', newUserId);
        localStorage.setItem('layR_userProfile', JSON.stringify(profile));
      } else {
        console.error('[UserContext] Registration failed:', response.error);
      }
    } catch (error) {
      console.error('[UserContext] Error registering user:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  // Clear user data on logout
  const clearUser = () => {
    setUserId(null);
    setUserProfile(null);
    localStorage.removeItem('layR_userId');
    localStorage.removeItem('layR_userProfile');
  };

  // Auto-register when user authenticates
  useEffect(() => {
    if (ready && authenticated && user && !userId) {
      registerUser();
    }
  }, [ready, authenticated, user, userId]);

  // Clear user data when logged out
  useEffect(() => {
    if (ready && !authenticated) {
      clearUser();
    }
  }, [ready, authenticated]);

  return (
    <UserContext.Provider
      value={{
        userId,
        userProfile,
        isRegistering,
        registerUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
