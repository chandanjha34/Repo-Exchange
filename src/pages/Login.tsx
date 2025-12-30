import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, ready, login } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [ready, isAuthenticated, navigate]);

  const handleLogin = () => {
    login();
  };

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
          <div className="fixed inset-0 bg-hero-gradient -z-10" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-hero-gradient -z-10" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-gradient opacity-20 -z-10" />

        <Card variant="glass" className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(180_70%_45%)] flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-bold">R</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Button
            type="button"
            variant="hero"
            className="w-full"
            size="lg"
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
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
