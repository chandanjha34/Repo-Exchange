import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Plus, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MovementWalletButton } from "../wallet";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { href: "/repositories", label: "Explore" },
    { href: "/bounties", label: "Bounty" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <header className="w-full bg-black border-b border-neutral-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14 md:h-16">
          {/* Left Section: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/layR logo.png" 
                alt="layR" 
                className="h-6 md:h-7 w-auto"
              />
            </Link>
          </div>

          {/* Center Section: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
              />
            </div>
          </div>

          {/* Right Section: Nav + Actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {/* Navigation Links */}
            <nav className="flex items-center">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                      location.pathname === link.href
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </button>
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="w-px h-6 bg-neutral-800 mx-2" />

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <Link to="/repositories/new">
                  <button className="px-3 py-1.5 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors rounded-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span className="hidden lg:inline">Add Project</span>
                  </button>
                </Link>

                <Link to="/profile/me">
                  <button className="p-2 text-neutral-400 hover:text-white transition-colors rounded-sm hover:bg-neutral-800">
                    <User className="w-5 h-5" />
                  </button>
                </Link>

                <MovementWalletButton />

                <button 
                  onClick={handleLogout}
                  className="p-2 text-neutral-400 hover:text-white transition-colors rounded-sm hover:bg-neutral-800"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button className="text-neutral-400 hover:text-white text-sm font-medium transition-colors px-3 py-2">
                    Sign in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors rounded-sm">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors ml-auto"
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
          <div className="md:hidden border-t border-neutral-800 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
              />
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full px-4 py-2.5 text-sm font-medium rounded-sm transition-colors text-left ${
                      location.pathname === link.href
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    {link.label}
                  </button>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-neutral-800" />

            {/* Mobile Auth Actions */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to="/repositories/new" className="block">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2.5 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors rounded-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </Link>

                <Link to="/profile/me" className="block">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2.5 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors rounded-sm text-sm flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile & Wallet
                  </button>
                </Link>

                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2.5 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors rounded-sm text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2.5 text-neutral-300 hover:text-white text-sm font-medium transition-colors rounded-sm hover:bg-neutral-900"
                  >
                    Sign in
                  </button>
                </Link>
                <Link to="/signup" className="block">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2.5 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors rounded-sm"
                  >
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
