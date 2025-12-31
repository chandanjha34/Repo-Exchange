import { useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { RepositoryCard } from "@/components/repository";
import { WalletProfileSection } from "@/components/wallet/WalletProfileSection";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Mail,
  GitFork,
  ExternalLink,
  Wallet,
  ChevronDown,
  ChevronUp,
  Eye,
  Star,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useProjects } from "@/hooks/useProjects";

const Profile = () => {
  const { username } = useParams();
  const { isAuthenticated } = useAuth();
  const { address, balance, isLoadingBalance } = useWallet();
  const [showWallet, setShowWallet] = useState(false);

  // Fetch user's projects (using wallet address as owner filter when available)
  const { projects: userProjects, isLoading: isLoadingProjects } = useProjects({
    owner: address || undefined,
    autoFetch: !!address,
  });

  // User data from wallet/auth
  const user = {
    name: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "User",
    username: username || "me",
    avatar: address 
      ? `https://api.dicebear.com/7.x/identicon/svg?seed=${address}` 
      : "https://api.dicebear.com/7.x/initials/svg?seed=User",
    bio: "Developer on layR marketplace",
    location: "",
    website: "",
    email: "",
    joinedDate: "2024",
    stats: {
      projects: userProjects.length,
      stars: userProjects.reduce((acc, p) => acc + p.stars, 0),
      forks: userProjects.reduce((acc, p) => acc + p.forks, 0),
      followers: 0,
    },
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Check if viewing own profile
  const isOwnProfile = isAuthenticated && (!username || username === "me");

  // Stats for dashboard-style cards (only shown on own profile)
  const dashboardStats = [
    { label: "Total Views", value: userProjects.reduce((acc, p) => acc + p.downloads, 0).toLocaleString(), change: "+12%", icon: Eye },
    { label: "Total Stars", value: user.stats.stars.toLocaleString(), change: "+8%", icon: Star },
    { label: "Fork Requests", value: user.stats.forks.toLocaleString(), change: "+5%", icon: GitFork },
    { label: "Projects", value: user.stats.projects.toString(), change: "+1", icon: MessageSquare },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6 sticky top-24">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
                
                <div className="relative">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 rounded-sm border-2 border-neutral-700 mx-auto object-cover bg-neutral-800"
                    />
                    {isOwnProfile && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <span className="px-3 py-1 bg-white text-black text-xs font-medium rounded-sm">
                          Pro
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="text-center mb-6">
                    <h1 className="font-heading text-2xl font-bold text-white">{user.name}</h1>
                    <p className="text-neutral-400">@{user.username}</p>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-neutral-400 mb-6">{user.bio}</p>

                  {/* Actions */}
                  {!isOwnProfile && (
                    <div className="flex gap-2 mb-6">
                      <button className="flex-1 px-4 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm text-sm">
                        Follow
                      </button>
                      <button className="px-4 py-2 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors rounded-sm">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Wallet Button - Only for authenticated user */}
                  {isOwnProfile && address && (
                    <button
                      onClick={() => setShowWallet(!showWallet)}
                      className="w-full flex items-center justify-between p-3 mb-6 bg-neutral-800/50 border border-neutral-700 hover:border-neutral-600 transition-colors rounded-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-4 h-4 text-white" />
                        <div className="text-left">
                          <p className="text-xs text-neutral-400">Wallet</p>
                          <p className="text-sm font-mono text-white">
                            {isLoadingBalance ? "..." : balance ? `${balance.balance} ${balance.symbol}` : truncateAddress(address)}
                          </p>
                        </div>
                      </div>
                      {showWallet ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>
                  )}

                  {/* Info */}
                  <div className="space-y-3 text-sm">
                    {user.location && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <MapPin className="w-4 h-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white hover:text-neutral-300 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>{user.website.replace("https://", "")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {user.joinedDate}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-neutral-800">
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">
                        {user.stats.projects}
                      </p>
                      <p className="text-xs text-neutral-400">Projects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">
                        {user.stats.followers.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">
                        {user.stats.stars.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400">Stars</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">
                        {user.stats.forks.toLocaleString()}
                      </p>
                      <p className="text-xs text-neutral-400">Forks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Wallet Section - Expandable */}
              {showWallet && isOwnProfile && (
                <WalletProfileSection />
              )}

              {/* Stats Grid - Only for own profile */}
              {isOwnProfile && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {dashboardStats.map((stat) => (
                    <div key={stat.label} className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-4">
                      {/* Glass effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center">
                            <stat.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="px-2 py-0.5 bg-white/10 text-white text-xs font-medium rounded-sm flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-white mb-0.5">{stat.value}</p>
                        <p className="text-xs text-neutral-400">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div className="flex items-center gap-4 mb-6 border-b border-neutral-800 pb-4">
                <button className="px-4 py-2 text-white font-medium border-b-2 border-white -mb-[17px] transition-colors">
                  Projects
                  <span className="ml-2 px-2 py-0.5 bg-neutral-800 text-white text-xs rounded-sm">
                    {userProjects.length}
                  </span>
                </button>
                <button className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">
                  Stars
                  <span className="ml-2 px-2 py-0.5 bg-neutral-800 text-neutral-400 text-xs rounded-sm">
                    {user.stats.stars}
                  </span>
                </button>
                <button className="px-4 py-2 text-neutral-400 hover:text-white transition-colors">
                  Forks
                  <span className="ml-2 px-2 py-0.5 bg-neutral-800 text-neutral-400 text-xs rounded-sm">
                    {user.stats.forks}
                  </span>
                </button>
              </div>

              {/* Projects Grid */}
              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : userProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {userProjects.map((project) => (
                    <RepositoryCard key={project._id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-12 text-center">
                  {/* Glass effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
                  
                  <div className="relative">
                    <div className="w-16 h-16 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-4">
                      <GitFork className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-white mb-2">
                      No projects yet
                    </h3>
                    <p className="text-neutral-400">
                      {isOwnProfile 
                        ? "You haven't uploaded any projects yet. Add your first project!"
                        : "This user hasn't uploaded any projects yet."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
