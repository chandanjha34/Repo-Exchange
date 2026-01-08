import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HomepageNavbar } from "@/components/homepage";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/contexts/UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, ready, login } = useAuth();
  const { userId, isRegistering } = useUser();

  // Redirect authenticated users with userId to dashboard
  useEffect(() => {
    if (ready && isAuthenticated && userId && !isRegistering) {
      navigate("/profile/me");
    }
  }, [ready, isAuthenticated, userId, isRegistering, navigate]);

  const handleLogin = () => {
    login();
  };

  // Show loading state while Privy initializes or user is registering
  if (!ready || isRegistering) {
    return (
      <div className="min-h-screen bg-black">
        <HomepageNavbar />
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
          <div className="flex items-center gap-2 text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{isRegistering ? 'Setting up your account...' : 'Loading...'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <HomepageNavbar />
      
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:py-16 md:py-20">
        {/* Login Card - Glass/Fluid Style */}
        <div className="relative w-full max-w-md bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6 sm:p-8">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
          
          {/* Content */}
          <div className="relative">
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <img 
                  src="/layR logo.png" 
                  alt="layR" 
                  className="h-8 w-auto mx-auto"
                />
              </Link>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base">
                Sign in to your account to continue
              </p>
            </div>

            <button
              type="button"
              className="w-full px-6 py-3 bg-white text-black font-medium rounded-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
              onClick={handleLogin}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-neutral-400 mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
