import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, GitFork, ExternalLink, Phone, Download } from "lucide-react";

export interface Repository {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  techStack: string[];
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  previewImage: string;
  stars: number;
  forks: number;
  downloads: number;
  demoUrl?: string;
  category: string;
  featured?: boolean;
}

interface RepositoryCardProps {
  repository: Repository;
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <Card variant="interactive" className="overflow-hidden group">
      {/* Preview Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={repository.previewImage}
          alt={repository.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        
        {repository.featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="tech" className="shadow-lg">
              Featured
            </Badge>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/60 backdrop-blur-sm">
          {repository.demoUrl && (
            <Button variant="hero" size="sm" asChild>
              <a href={repository.demoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            </Button>
          )}
          <Button variant="glass" size="sm">
            <Phone className="w-4 h-4" />
            Book Call
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={repository.author.avatar}
            alt={repository.author.name}
            className="w-6 h-6 rounded-full border border-border"
          />
          <Link
            to={`/profile/${repository.author.username}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {repository.author.name}
          </Link>
        </div>

        {/* Title */}
        <Link to={`/repository/${repository.slug}`}>
          <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {repository.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {repository.shortDescription}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repository.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {repository.techStack.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{repository.techStack.length - 4}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Star className="w-4 h-4" />
              <span>{repository.stars.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <GitFork className="w-4 h-4" />
              <span>{repository.forks.toLocaleString()}</span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Download className="w-4 h-4" />
              <span>{repository.downloads.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
