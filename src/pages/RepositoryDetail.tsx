import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectBySlug } from "@/hooks/useProjects";
import { useAccess } from "@/hooks/useAccess";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Star,
  GitFork,
  Download,
  Share2,
  Calendar,
  Scale,
  ArrowLeft,
  Check,
  Lock,
  Eye,
  User,
  Sparkles,
} from "lucide-react";
import { PurchaseModal } from "@/components/payment/PurchaseModal";

const RepositoryDetail = () => {
  const { slug } = useParams();
  const { project, isLoading, error, refetch } = useProjectBySlug(slug);
  const { hasDemo, hasDownload, isOwner, isLoading: accessLoading, refetch: refetchAccess } = useAccess(project?._id);
  const { user } = usePrivy();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedAccessType, setSelectedAccessType] = useState<'demo' | 'download'>('demo');

  const userAddress = user?.wallet?.address;

  // Access levels from the new useAccess hook
  const hasViewAccess = hasDemo || isOwner;
  const hasDownloadAccess = hasDownload || isOwner;

  const handlePaymentSuccess = () => {
    refetchAccess();
    refetch();
  };

  const handlePurchaseClick = (type: 'demo' | 'download') => {
    setSelectedAccessType(type);
    setPurchaseModalOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
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
            <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
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
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/repositories" className="hover:text-emerald-400 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-white">{project.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Image */}
            <div className="relative bg-neutral-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
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
                        className="w-6 h-6 rounded-full border border-emerald-500/30"
                      />
                      <span className="text-sm text-gray-400">
                        {project.ownerName}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {project.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 leading-relaxed mb-6">
                {project.shortDescription}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="bg-neutral-900 text-gray-300 border border-emerald-500/20">
                    {tech}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-neutral-950/80 border border-emerald-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-white">
                    {project.stats?.likes?.toLocaleString() || 0}
                  </span>
                  <span className="text-sm text-gray-400">stars</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-white">
                    {project.stats?.forks?.toLocaleString() || 0}
                  </span>
                  <span className="text-sm text-gray-400">forks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-white">
                    {project.stats?.downloads?.toLocaleString() || 0}
                  </span>
                  <span className="text-sm text-gray-400">downloads</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {hasViewAccess ? (
              <div id="project-description" className="relative bg-neutral-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl pointer-events-none" />
                <div className="relative">
                  <h2 className="font-heading text-xl font-semibold text-white mb-4">
                    About this Project
                  </h2>
                  <div className="prose prose-invert max-w-none text-gray-400">
                    <p>{project.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative bg-neutral-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl pointer-events-none" />
                <div className="relative text-center py-8">
                  <Lock className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
                  <h2 className="font-heading text-xl font-semibold text-white mb-2">
                    Demo Access Required
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Purchase demo access to view full project details
                  </p>
                  <Button
                    onClick={() => handlePurchaseClick('demo')}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-black hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] rounded-full font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    View Demo - {formatPrice(project.demoPrice)}
                  </Button>
                </div>
              </div>
            )}

            {/* What's Included */}
            {hasViewAccess && (
              <div className="relative bg-neutral-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl pointer-events-none" />
                <div className="relative">
                  <h2 className="font-heading text-xl font-semibold text-white mb-4">
                    What's Included
                  </h2>
                  <ul className="space-y-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing & Action Card */}
            <div className="relative bg-neutral-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 sticky top-24 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl pointer-events-none" />
              <div className="relative space-y-4">
                <h3 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Access Options
                </h3>

                {/* Demo Access */}
                <div className="p-4 bg-neutral-900/50 rounded-xl border border-emerald-500/20 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-medium text-white">Demo Access</h4>
                      </div>
                      <p className="text-xs text-gray-400">
                        View project details and preview
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">
                        {formatPrice(project.demoPrice)}
                      </p>
                    </div>
                  </div>

                  {hasViewAccess ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-emerald-400 mb-2">
                        <Check className="w-4 h-4" />
                        <span>You have access</span>
                      </div>
                      {project.demoUrl ? (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button
                            className="w-full bg-neutral-800 text-white hover:bg-neutral-700 border border-emerald-500/20 rounded-full"
                          >
                            <Eye className="w-4 h-4" />
                            View Live Demo
                          </Button>
                        </a>
                      ) : (
                        <Button
                          onClick={() => {
                            // Scroll to project description section
                            document.querySelector('#project-description')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full bg-neutral-800 text-white hover:bg-neutral-700 border border-emerald-500/20 rounded-full"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => handlePurchaseClick('demo')}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded-full font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      View Demo
                    </Button>
                  )}
                </div>

                {/* Download Access */}
                <div className="p-4 bg-neutral-900/50 rounded-xl border border-emerald-500/20 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-medium text-white">Full Download</h4>
                      </div>
                      <p className="text-xs text-gray-400">
                        Complete source code and files
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">
                        {formatPrice(project.downloadPrice)}
                      </p>
                    </div>
                  </div>

                  {hasDownloadAccess ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-emerald-400 mb-2">
                        <Check className="w-4 h-4" />
                        <span>You have access</span>
                      </div>
                      {project.zipFileUrl ? (
                        <a
                          href={project.zipFileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded-full font-semibold"
                          >
                            <Download className="w-4 h-4" />
                            Download Project
                          </Button>
                        </a>
                      ) : (
                        <Button
                          onClick={() => {
                            alert('Download file not available for this project. Please contact the project owner.');
                          }}
                          className="w-full bg-neutral-800 text-white hover:bg-neutral-700 border border-emerald-500/20 rounded-full"
                        >
                          <Download className="w-4 h-4" />
                          Download Project
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={() => handlePurchaseClick('download')}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded-full font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      Purchase Download
                    </Button>
                  )}
                </div>

                <button className="w-full px-4 py-3 border border-emerald-500/30 text-gray-300 font-medium rounded-full hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>

                <div className="mt-6 pt-6 border-t border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Updated
                    </span>
                    <span className="text-white">{formatDate(project.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      License
                    </span>
                    <span className="text-white">MIT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Card */}
            <div className="relative bg-neutral-950/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl pointer-events-none" />
              <div className="relative">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Project Owner
                </h3>
                <div className="flex items-center gap-3">
                  <img
                    src={project.ownerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${project.ownerName}`}
                    alt={project.ownerName}
                    className="w-12 h-12 rounded-full border-2 border-emerald-500/30"
                  />
                  <div>
                    <p className="font-medium text-white">
                      {project.ownerName}
                    </p>
                    {project.ownerWalletAddress && (
                      <p className="text-sm text-gray-400">
                        {project.ownerWalletAddress.slice(0, 6)}...{project.ownerWalletAddress.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Modal */}
        {project && (
          <PurchaseModal
            isOpen={purchaseModalOpen}
            onClose={() => setPurchaseModalOpen(false)}
            project={project}
            accessType={selectedAccessType}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default RepositoryDetail;