import { useState, useEffect, useCallback } from 'react';
import { projectApi, Project } from '@/lib/api';

interface UseProjectsOptions {
  page?: number;
  limit?: number;
  owner?: string;
  search?: string;
  category?: string;
  featured?: boolean;
  autoFetch?: boolean;
}

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  refetch: () => Promise<void>;
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { page = 1, limit = 20, owner, search, category, featured, autoFetch = true } = options;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseProjectsReturn['pagination']>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await projectApi.list({ page, limit, owner, search, category, featured });
      
      if (response.success && response.data) {
        setProjects(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Failed to fetch projects');
        setProjects([]);
      }
    } catch (err) {
      setError('Network error');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, owner, search, category, featured]);

  useEffect(() => {
    if (autoFetch) {
      fetchProjects();
    }
  }, [fetchProjects, autoFetch]);

  return {
    projects,
    isLoading,
    error,
    pagination,
    refetch: fetchProjects,
  };
}

interface UseProjectReturn {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProject(id: string | undefined): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await projectApi.getById(id);
      
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError(response.error || 'Project not found');
        setProject(null);
      }
    } catch (err) {
      setError('Network error');
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    isLoading,
    error,
    refetch: fetchProject,
  };
}

export function useProjectBySlug(slug: string | undefined): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await projectApi.getBySlug(slug);
      
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError(response.error || 'Project not found');
        setProject(null);
      }
    } catch (err) {
      setError('Network error');
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    isLoading,
    error,
    refetch: fetchProject,
  };
}
