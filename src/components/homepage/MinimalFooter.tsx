/**
 * MinimalFooter - A minimal footer component for the homepage
 * 
 * Features:
 * - Dark background with top border
 * - Centered attribution text
 * - Small font size
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function MinimalFooter() {
  return (
    <footer className="w-full bg-black border-t border-neutral-800 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <p className="text-xs sm:text-sm text-neutral-500 text-center">
          Made by team async await from India ❤️
        </p>
      </div>
    </footer>
  );
}

export default MinimalFooter;
