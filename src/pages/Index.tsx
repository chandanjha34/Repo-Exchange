import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RepositoryCard, mockRepositories } from "@/components/repository";
import { 
  ArrowRight, 
  Search, 
  Sparkles, 
  Shield, 
  Zap,
  Users,
  Star,
  GitFork,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const featuredRepos = mockRepositories.filter((r) => r.featured);
  const stats = [
    { label: "Repositories", value: "2,500+", icon: GitFork },
    { label: "Developers", value: "15,000+", icon: Users },
    { label: "Stars Given", value: "100K+", icon: Star },
    { label: "Downloads", value: "500K+", icon: TrendingUp },
  ];

  const features = [
    {
      icon: Search,
      title: "Discover Quality Code",
      description: "Browse thousands of curated repositories with advanced search and filtering.",
    },
    {
      icon: Sparkles,
      title: "Premium Assets",
      description: "Access production-ready templates, UI kits, and starter projects.",
    },
    {
      icon: Shield,
      title: "Verified Quality",
      description: "All repositories are reviewed for code quality and best practices.",
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Fork and customize any repository to jumpstart your next project.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-glow-gradient opacity-30 animate-pulse-glow" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
              <Badge variant="tech" className="px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                The Future of Code Sharing
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
              <span className="text-foreground">Discover Premium</span>
              <br />
              <span className="gradient-text">Code Repositories</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              The marketplace for high-quality repositories. Find production-ready templates, 
              UI kits, and starter projects from top developers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/repositories">
                <Button variant="hero" size="xl">
                  Explore Repositories
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/repositories/new">
                <Button variant="hero-outline" size="xl">
                  Add Your Repo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-4">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why RepoMarket?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The best platform to discover, share, and monetize your code repositories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Repositories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Featured Repositories
              </h2>
              <p className="text-muted-foreground">
                Hand-picked by our team for exceptional quality
              </p>
            </div>
            <Link to="/repositories">
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRepos.map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Share Your Work?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of developers showcasing their projects on RepoMarket.
              Get discovered, earn recognition, and connect with potential clients.
            </p>
            <Link to="/signup">
              <Button variant="gradient" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
