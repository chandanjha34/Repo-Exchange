import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import {
  Search,
  Check,
  X,
  Eye,
  Star,
  Trash2,
  Shield,
  Users,
  GitFork,
  TrendingUp,
} from "lucide-react";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  // Fetch all projects
  const { projects, isLoading } = useProjects({ limit: 100 });

  const stats = [
    { label: "Total Repos", value: projects.length.toString(), icon: GitFork },
    { label: "Pending Review", value: projects.filter(p => !p.isPublished).length.toString(), icon: Shield },
    { label: "Total Users", value: "0", icon: Users },
    { label: "Featured", value: projects.filter(p => p.isFeatured).length.toString(), icon: TrendingUp },
  ];

  // Map projects to admin format
  const pendingRepos = projects.map((project) => ({
    id: project._id,
    name: project.title,
    slug: project.slug,
    previewImage: project.previewImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    status: project.isPublished ? "approved" : "pending",
    featured: project.isFeatured,
    author: {
      name: project.ownerName,
    },
    submittedAt: new Date(project.createdAt).toLocaleDateString(),
  }));

  const filteredRepos = pendingRepos.filter((repo) => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || repo.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">
            Manage repositories, users, and platform settings
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Repository List */}
        <Card>
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Repository Queue</h2>
          </div>
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No repositories found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredRepos.map((repo) => (
              <div key={repo.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <img
                  src={repo.previewImage}
                  alt={repo.name}
                  className="w-16 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{repo.name}</h3>
                    <Badge
                      variant={
                        repo.status === "approved"
                          ? "tech"
                          : repo.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {repo.status}
                    </Badge>
                    {repo.featured && (
                      <Badge variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    by {repo.author.name} • Submitted {repo.submittedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon-sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {repo.status === "pending" && (
                    <>
                      <Button variant="ghost" size="icon-sm" className="text-primary hover:text-primary">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon-sm">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;