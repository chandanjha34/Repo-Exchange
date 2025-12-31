import { Link } from "react-router-dom";
import { Star, GitFork, ExternalLink, Phone, Download } from "lucide-react";
import { Project } from "@/lib/api";

interface RepositoryCardProps {
  project: Project;
}

export function RepositoryCard({ project }: RepositoryCardProps) {
  return (
    <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm overflow-hidden group hover:border-neutral-700 transition-all duration-300">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
      
      {/* Preview Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.previewImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop"}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {project.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium rounded-sm">
              Featured
            </span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm">
          {project.demoUrl && (
            <a 
              href={project.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-sm hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Live Demo
            </a>
          )}
          <button className="px-4 py-2 border border-white text-white text-sm font-medium rounded-sm hover:bg-white hover:text-black transition-colors flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Book Call
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={project.ownerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${project.ownerName}`}
            alt={project.ownerName}
            className="w-6 h-6 rounded-full border border-neutral-700"
          />
          <span className="text-sm text-neutral-400">
            {project.ownerName}
          </span>
        </div>

        {/* Title */}
        <Link to={`/repository/${project.slug}`}>
          <h3 className="font-heading font-semibold text-lg text-white mb-2 hover:text-neutral-300 transition-colors line-clamp-1">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
          {project.shortDescription}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.slice(0, 4).map((tech) => (
            <span key={tech} className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-sm">
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-1 border border-neutral-700 text-neutral-400 text-xs rounded-sm">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors">
              <Star className="w-4 h-4" />
              <span>{project.stars.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors">
              <GitFork className="w-4 h-4" />
              <span>{project.forks.toLocaleString()}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-neutral-400">
              <Download className="w-4 h-4" />
              <span>{project.downloads.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
