import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useProjectBySlug } from "@/hooks/useProjects";
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
  const { project, isLoading, error } = useProjectBySlug(slug);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Project not found
          </h1>
          <Link to="/repositories">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
          <Link to="/repositories" className="hover:text-white transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-white">{project.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Image */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              <img
                src={project.previewImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop"}
                alt={project.title}
                className="w-full aspect-video object-cover"
              />
            </div>

            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-heading text-3xl font-bold text-white mb-2">
                    {project.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={project.ownerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${project.ownerName}`}
                        alt={project.ownerName}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-neutral-400">
                        {project.ownerName}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                      {project.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-neutral-400 leading-relaxed mb-6">
                {project.shortDescription}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="bg-neutral-800 text-neutral-300">
                    {tech}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 p-4 rounded-sm bg-neutral-900/50 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white">
                    {project.stars.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-400">stars</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white">
                    {project.forks.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-400">forks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-white" />
                  <span className="font-semibold text-white">
                    {project.downloads.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-400">downloads</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-4">
                  About this Project
                </h2>
                <div className="prose prose-invert max-w-none text-neutral-400">
                  <p>{project.description}</p>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-4">
                  What's Included
                </h2>
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-neutral-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6 sticky top-24">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              <div className="relative space-y-4">
                {project.demoUrl && (
                  <a 
                    href={project.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 bg-white text-black font-medium rounded-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}

                <button className="w-full px-4 py-3 bg-neutral-800 text-white font-medium rounded-sm hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2">
                  <GitFork className="w-4 h-4" />
                  Fork Project
                </button>

                <button className="w-full px-4 py-3 border border-neutral-700 text-neutral-300 font-medium rounded-sm hover:border-neutral-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Book a Call
                </button>

                <button className="w-full px-4 py-3 border border-neutral-700 text-neutral-300 font-medium rounded-sm hover:border-neutral-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>

                <div className="mt-6 pt-6 border-t border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Updated
                    </span>
                    <span className="text-white">{formatDate(project.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      License
                    </span>
                    <span className="text-white">MIT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Card */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              <div className="relative">
                <h3 className="font-semibold text-white mb-4">About the Author</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={project.ownerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${project.ownerName}`}
                    alt={project.ownerName}
                    className="w-12 h-12 rounded-full border-2 border-neutral-700"
                  />
                  <div>
                    <p className="font-medium text-white">
                      {project.ownerName}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Project Creator
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RepositoryDetail;
