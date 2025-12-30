import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockRepositories } from "@/components/repository";
import {
  Star,
  GitFork,
  Download,
  ExternalLink,
  Phone,
  Share2,
  Calendar,
  Scale,
  ArrowLeft,
  Check,
} from "lucide-react";

const RepositoryDetail = () => {
  const { slug } = useParams();
  const repository = mockRepositories.find((r) => r.slug === slug);

  if (!repository) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Repository not found
          </h1>
          <Link to="/repositories">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Back to Repositories
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const features = [
    "Production-ready code structure",
    "Full documentation included",
    "Regular updates and maintenance",
    "Discord community access",
    "Email support for 6 months",
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/repositories" className="hover:text-foreground transition-colors">
            Repositories
          </Link>
          <span>/</span>
          <span className="text-foreground">{repository.name}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Image */}
            <Card variant="glass" className="overflow-hidden">
              <img
                src={repository.previewImage}
                alt={repository.name}
                className="w-full aspect-video object-cover"
              />
            </Card>

            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {repository.name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/profile/${repository.author.username}`}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      <img
                        src={repository.author.avatar}
                        alt={repository.author.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-muted-foreground">
                        {repository.author.name}
                      </span>
                    </Link>
                    <Badge variant="tech">{repository.category}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {repository.shortDescription}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-6">
                {repository.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {repository.stars.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">stars</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {repository.forks.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">forks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {repository.downloads.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">downloads</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                About this Repository
              </h2>
              <div className="prose prose-invert max-w-none text-muted-foreground">
                <p>
                  This {repository.category.toLowerCase()} template is designed to help you 
                  launch your project faster. Built with modern technologies and best practices, 
                  it includes everything you need to get started.
                </p>
                <p className="mt-4">
                  Whether you're a solo developer or working with a team, this template 
                  provides a solid foundation with clean code architecture, comprehensive 
                  documentation, and ongoing support.
                </p>
              </div>
            </Card>

            {/* What's Included */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                What's Included
              </h2>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card className="p-6 sticky top-24">
              <div className="space-y-4">
                {repository.demoUrl && (
                  <Button variant="hero" className="w-full" size="lg" asChild>
                    <a href={repository.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  </Button>
                )}

                <Button variant="gradient" className="w-full" size="lg">
                  <GitFork className="w-4 h-4" />
                  Fork Repository
                </Button>

                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="w-4 h-4" />
                  Book a Call
                </Button>

                <Button variant="ghost" className="w-full" size="lg">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Updated
                  </span>
                  <span className="text-foreground">2 days ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    License
                  </span>
                  <span className="text-foreground">MIT</span>
                </div>
              </div>
            </Card>

            {/* Author Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">About the Author</h3>
              <Link
                to={`/profile/${repository.author.username}`}
                className="flex items-center gap-3 group"
              >
                <img
                  src={repository.author.avatar}
                  alt={repository.author.name}
                  className="w-12 h-12 rounded-full border-2 border-border group-hover:border-primary transition-colors"
                />
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {repository.author.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{repository.author.username}
                  </p>
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RepositoryDetail;
