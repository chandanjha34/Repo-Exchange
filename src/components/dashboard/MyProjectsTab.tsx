import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderGit2, Eye, Download, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProjectStats {
  likes: number;
  forks: number;
  downloads: number;
  views: number;
}

interface Project {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  demoPrice: number;
  downloadPrice: number;
  previewImage?: string;
  isPublished: boolean;
  stats: ProjectStats;
  createdAt: string;
}

interface MyProjectsTabProps {
  userId: string;
}

export function MyProjectsTab({ userId }: MyProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE}/api/projects?ownerId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setProjects(data.data);
        }
      } catch (err) {
        console.error('[MyProjectsTab] Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-neutral-800/50 rounded-sm animate-pulse" />
        <div className="h-32 bg-neutral-800/50 rounded-sm animate-pulse" />
        <div className="h-32 bg-neutral-800/50 rounded-sm animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 p-4 bg-red-900/20 border border-red-800 rounded-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Project Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white">My Projects</h2>
          <p className="text-sm text-neutral-400 mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </div>
        <Link
          to="/add-repository"
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </Link>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
          
          <div className="relative">
            <div className="w-16 h-16 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-4">
              <FolderGit2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-white mb-2">
              No projects yet
            </h3>
            <p className="text-neutral-400 mb-6">
              Start by adding your first project to the marketplace
            </p>
            <Link
              to="/add-repository"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm"
            >
              <Plus className="w-4 h-4" />
              Add Your First Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm overflow-hidden hover:border-neutral-700 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              
              <div className="relative p-6">
                <div className="flex gap-6">
                  {/* Preview Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={project.previewImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=150&fit=crop'}
                      alt={project.title}
                      className="w-32 h-24 object-cover rounded-sm border border-neutral-700"
                    />
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/repository/${project.slug}`}
                          className="font-heading text-lg font-semibold text-white hover:text-neutral-300 transition-colors line-clamp-1"
                        >
                          {project.title}
                        </Link>
                        <p className="text-sm text-neutral-400 line-clamp-2 mt-1">
                          {project.shortDescription}
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      <div>
                        {project.isPublished ? (
                          <span className="px-3 py-1 bg-green-900/30 border border-green-700 text-green-400 text-xs font-medium rounded-sm">
                            Published
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-700 text-yellow-400 text-xs font-medium rounded-sm">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category and Pricing */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-sm">
                        {project.category}
                      </span>
                      <span className="text-sm text-neutral-400">
                        Demo: {formatPrice(project.demoPrice)}
                      </span>
                      <span className="text-sm text-neutral-400">
                        Download: {formatPrice(project.downloadPrice)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Eye className="w-4 h-4" />
                        <span>{project.stats.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Download className="w-4 h-4" />
                        <span>{project.stats.downloads.toLocaleString()} downloads</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Heart className="w-4 h-4" />
                        <span>{project.stats.likes.toLocaleString()} likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
