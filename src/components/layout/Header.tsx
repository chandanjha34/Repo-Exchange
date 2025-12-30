import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, Plus, User, LayoutDashboard, LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Truncates a wallet address for display
 * Shows first 6 and last 4 characters
 */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, walletAddress, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { href: "/repositories", label: "Explore" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(180_70%_45%)] flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-foreground hidden sm:block">
              RepoMarket
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant={location.pathname === link.href ? "secondary" : "ghost"}
                  size="sm"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                className="pl-10 h-9 bg-secondary/30"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/repositories/new" className="hidden sm:block">
                  <Button variant="hero" size="sm">
                    <Plus className="w-4 h-4" />
                    Add Repo
                  </Button>
                </Link>

                <Link to="/dashboard">
                  <Button variant="ghost" size="icon-sm" className="hidden sm:flex">
                    <LayoutDashboard className="w-4 h-4" />
                  </Button>
                </Link>

                {/* Wallet Address Display */}
                {walletAddress && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-border/50">
                    <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">
                      {truncateAddress(walletAddress)}
                    </span>
                  </div>
                )}

                {/* Logout Button */}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  className="pl-10"
                />
              </div>
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant={location.pathname === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/repositories/new">
                    <Button variant="hero" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                      <Plus className="w-4 h-4" />
                      Add Repository
                    </Button>
                  </Link>
                  {/* Mobile Wallet Address Display */}
                  {walletAddress && (
                    <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-secondary/50 border border-border/50">
                      <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {truncateAddress(walletAddress)}
                      </span>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
