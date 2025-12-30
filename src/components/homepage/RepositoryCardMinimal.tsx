import { Link } from "react-router-dom";

/**
 * RepositoryCardMinimal - A minimal, GitHub-inspired repository card
 * 
 * Features:
 * - Dark card background with neutral border
 * - Repository name, description, author display
 * - View button with outline style
 * - Sharp corners (minimal border-radius)
 */
export interface RepositoryCardMinimalProps {
  name: string;
  description: string;
  author: string;
  slug: string;
}

export function RepositoryCardMinimal({
  name,
  description,
  author,
  slug,
}: RepositoryCardMinimalProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-4 sm:p-6 rounded-sm">
      {/* Repository Name */}
      <h3 className="font-heading font-semibold text-white text-base sm:text-lg mb-1.5 sm:mb-2">
        {name}
      </h3>

      {/* Description */}
      <p className="text-neutral-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
        {description}
      </p>

      {/* Author and View Button Row */}
      <div className="flex items-center justify-between">
        <span className="text-neutral-500 text-xs">
          by {author}
        </span>
        <Link
          to={`/repository/${slug}`}
          className="px-3 sm:px-4 py-1.5 text-white border border-neutral-700 hover:border-white text-xs sm:text-sm font-medium transition-colors rounded-sm"
        >
          View
        </Link>
      </div>
    </div>
  );
}

export default RepositoryCardMinimal;
