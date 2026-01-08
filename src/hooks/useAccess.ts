import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Access status response from backend
 */
interface AccessStatus {
  hasDemo: boolean;
  hasDownload: boolean;
  isOwner: boolean;
}

/**
 * Hook return type
 */
interface UseAccessReturn {
  hasDemo: boolean;
  hasDownload: boolean;
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for checking user access to a project
 * 
 * Checks Purchase table for access status
 * Requirements: 14.1-14.4
 */
export function useAccess(projectId: string | undefined): UseAccessReturn {
  const { userId } = useAuth();

  const [hasDemo, setHasDemo] = useState(false);
  const [hasDownload, setHasDownload] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    // Reset state
    setHasDemo(false);
    setHasDownload(false);
    setIsOwner(false);

    // Don't check if no project or no user
    if (!projectId || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/access/check?projectId=${projectId}&userId=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const accessStatus = data.data as AccessStatus;
        setHasDemo(accessStatus.hasDemo);
        setHasDownload(accessStatus.hasDownload);
        setIsOwner(accessStatus.isOwner);
      } else {
        setError(data.error || 'Failed to check access');
      }
    } catch (err) {
      console.error('[useAccess] Error checking access:', err);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, userId]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    hasDemo,
    hasDownload,
    isOwner,
    isLoading,
    error,
    refetch: checkAccess,
  };
}
