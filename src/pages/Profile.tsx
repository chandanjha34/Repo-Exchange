import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RepositoryCard, mockRepositories } from "@/components/repository";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Mail,
  Star,
  GitFork,
  Users,
  ExternalLink,
} from "lucide-react";

const Profile = () => {
  const { username } = useParams();

  // Mock user data
  const user = {
    name: "Alex Chen",
    username: username || "alexchen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "Full-stack developer passionate about building beautiful, functional web applications. Creator of Next.js SaaS Starter Kit and other open-source projects.",
    location: "San Francisco, CA",
    website: "https://alexchen.dev",
    email: "alex@example.com",
    joinedDate: "January 2023",
    stats: {
      repositories: 12,
      stars: 4500,
      forks: 890,
      followers: 1200,
    },
  };

  const userRepos = mockRepositories.filter(
    (r) => r.author.username === username || r.author.username === "alexchen"
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              {/* Avatar */}
              <div className="relative mb-6">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-border mx-auto"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge variant="tech">Pro</Badge>
                </div>
              </div>

              {/* Name */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground mb-6">{user.bio}</p>

              {/* Actions */}
              <div className="flex gap-2 mb-6">
                <Button variant="hero" className="flex-1">
                  Follow
                </Button>
                <Button variant="outline" size="icon">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>

              {/* Info */}
              <div className="space-y-3 text-sm">
                {user.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>{user.website.replace("https://", "")}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.joinedDate}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">
                    {user.stats.repositories}
                  </p>
                  <p className="text-xs text-muted-foreground">Repositories</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">
                    {user.stats.followers.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">
                    {user.stats.stars.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">
                    {user.stats.forks.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Forks</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
              <Button variant="ghost" className="text-foreground">
                Repositories
                <Badge variant="secondary" className="ml-2">
                  {userRepos.length}
                </Badge>
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                Stars
                <Badge variant="secondary" className="ml-2">
                  {user.stats.stars}
                </Badge>
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                Forks
                <Badge variant="secondary" className="ml-2">
                  {user.stats.forks}
                </Badge>
              </Button>
            </div>

            {/* Repositories Grid */}
            {userRepos.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {userRepos.map((repo) => (
                  <RepositoryCard key={repo.id} repository={repo} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <GitFork className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No repositories yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  This user hasn't uploaded any repositories yet.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
