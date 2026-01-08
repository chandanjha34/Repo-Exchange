import { useEffect, useState } from 'react';
import { FolderGit2, DollarSign, GitFork, Heart } from 'lucide-react';

interface DashboardStatsData {
  totalProjects: number;
  totalEarnings: number; // in MOVE
  totalForks: number;
  totalLikes: number;
}

interface DashboardStatsProps {
  userId: string;
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStatsData>({
    totalProjects: 0,
    totalEarnings: 0,
    totalForks: 0,
    totalLikes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE}/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user stats');
        }

        const data = await response.json();
        
        if (data.success && data.stats) {
          setStats({
            totalProjects: data.stats.totalProjects || 0,
            totalEarnings: data.stats.totalEarnings || 0,
            totalForks: data.stats.totalForks || 0,
            totalLikes: data.stats.totalLikes || 0,
          });
        }
      } catch (err) {
        console.error('[DashboardStats] Error fetching stats:', err);
        setError('Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-neutral-800/50 rounded-sm animate-pulse" />
        <div className="h-16 bg-neutral-800/50 rounded-sm animate-pulse" />
        <div className="h-16 bg-neutral-800/50 rounded-sm animate-pulse" />
        <div className="h-16 bg-neutral-800/50 rounded-sm animate-pulse" />
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

  const statItems = [
    {
      label: 'Projects',
      value: stats.totalProjects.toString(),
      icon: FolderGit2,
      color: 'text-blue-400',
    },
    {
      label: 'Earnings',
      value: `${stats.totalEarnings.toFixed(2)} MOVE`,
      icon: DollarSign,
      color: 'text-green-400',
    },
    {
      label: 'Forks',
      value: stats.totalForks.toString(),
      icon: GitFork,
      color: 'text-purple-400',
    },
    {
      label: 'Likes',
      value: stats.totalLikes.toString(),
      icon: Heart,
      color: 'text-pink-400',
    },
  ];

  return (
    <div className="space-y-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center justify-between p-4 bg-neutral-800/30 border border-neutral-800 rounded-sm hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-sm bg-neutral-800 flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">{stat.label}</p>
                <p className="text-lg font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
