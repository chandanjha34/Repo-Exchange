import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";

/**
 * HomepageNavbar - A minimal, GitHub-inspired navigation bar for the homepage
 * 
 * Features:
 * - Dark background with thin bottom border
 * - layR logo image
 * - Search input with dark styling
 * - Sign in text button and Register outlined button
 * - Sharp edges, minimal border-radius
 * - Mobile-responsive with collapsible menu
 */
export function HomepageNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-black border-b border-neutral-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/layR logo.png" 
              alt="layR" 
              className="h-6 md:h-7 w-auto"
            />
          </Link>

          {/* Search Bar - Center-right area (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search repositories"
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
              />
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-neutral-300 hover:text-white text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 border border-white text-white text-sm font-medium hover:bg-white hover:text-black transition-colors rounded-sm"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-800 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search repositories"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
              />
            </div>

            {/* Mobile Auth Links */}
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-neutral-300 hover:text-white text-sm font-medium transition-colors py-2"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 border border-white text-white text-sm font-medium hover:bg-white hover:text-black transition-colors rounded-sm text-center"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default HomepageNavbar;
