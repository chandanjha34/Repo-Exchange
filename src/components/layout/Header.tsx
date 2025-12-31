import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Plus, LayoutDashboard, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { WalletButton } from "../wallet";

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
    { href: "/dashboard", label: "Dashboard" },
  ];

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                    location.pathname === link.href
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  {link.label}
                </button>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Center-right area (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search projects"
                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
              />
            </div>
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/repositories/new">
                  <button className="px-4 py-2 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors rounded-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </Link>

                <Link to="/dashboard">
                  <button className="p-2 text-neutral-300 hover:text-white transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                  </button>
                </Link>

                <Link to="/profile/me">
                  <button className="p-2 text-neutral-300 hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </Link>

                {/* Wallet Button with Popup */}
                <WalletButton />

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors rounded-sm text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-neutral-300 hover:text-white text-sm font-medium transition-colors">
                    Sign in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 border border-white text-white text-sm font-medium hover:bg-white hover:text-black transition-colors rounded-sm">
                    Register
                  </button>
                </Link>
              </>
            )}
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
                placeholder="Search projects"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
              />
            </div>

            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-sm transition-colors text-left ${
                    location.pathname === link.href
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  {link.label}
                </button>
              </Link>
            ))}

            {/* Mobile Auth Actions */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/repositories/new">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2.5 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors rounded-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </Link>

                {/* Mobile Wallet Link */}
                <Link to="/profile/me">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2.5 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors rounded-sm text-sm flex items-center justify-center gap-2"
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
                  className="w-full px-4 py-2.5 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors rounded-sm text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-neutral-300 hover:text-white text-sm font-medium transition-colors py-2"
                  >
                    Sign in
                  </button>
                </Link>
                <Link to="/signup">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2.5 border border-white text-white text-sm font-medium hover:bg-white hover:text-black transition-colors rounded-sm text-center"
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
