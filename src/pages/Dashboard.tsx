import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockRepositories } from "@/components/repository";
import {
  Plus,
  GitFork,
  MessageSquare,
  TrendingUp,
  Eye,
  Star,
  ArrowRight,
  Settings,
} from "lucide-react";

const Dashboard = () => {
  const userRepos = mockRepositories.slice(0, 3);

  const stats = [
    { label: "Total Views", value: "12,432", change: "+12%", icon: Eye },
    { label: "Total Stars", value: "847", change: "+8%", icon: Star },
    { label: "Fork Requests", value: "23", change: "+5%", icon: GitFork },
    { label: "Messages", value: "12", change: "+3", icon: MessageSquare },
  ];

  const recentActivity = [
    { type: "star", user: "johndoe", repo: "Next.js SaaS Starter Kit", time: "2 hours ago" },
    { type: "fork", user: "sarahm", repo: "React Dashboard Pro", time: "5 hours ago" },
    { type: "message", user: "mikeb", repo: "E-Commerce Platform", time: "1 day ago" },
    { type: "star", user: "lisaa", repo: "AI Chatbot Template", time: "2 days ago" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your repositories.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
            <Link to="/repositories/new">
              <Button variant="hero">
                <Plus className="w-4 h-4" />
                Add Repository
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="tech" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Repositories */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">My Repositories</h2>
              <Link to="/repositories">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {userRepos.map((repo) => (
                <Card key={repo.id} variant="interactive" className="p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={repo.previewImage}
                      alt={repo.name}
                      className="w-20 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/repository/${repo.slug}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {repo.name}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {repo.shortDescription}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GitFork className="w-4 h-4" />
                          {repo.forks}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {repo.downloads}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            <Card className="p-4">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "star"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : activity.type === "fork"
                          ? "bg-primary/10 text-primary"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {activity.type === "star" && <Star className="w-4 h-4" />}
                      {activity.type === "fork" && <GitFork className="w-4 h-4" />}
                      {activity.type === "message" && <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.user}</span>
                        {activity.type === "star" && " starred "}
                        {activity.type === "fork" && " requested fork for "}
                        {activity.type === "message" && " sent a message about "}
                        <span className="text-primary">{activity.repo}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/repositories/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4" />
                  Add New Repository
                </Button>
              </Link>
              <Link to="/profile/me" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
