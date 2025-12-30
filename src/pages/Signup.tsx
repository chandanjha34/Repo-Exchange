import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Signup = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, ready, login } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [ready, isAuthenticated, navigate]);

  const handleSignup = () => {
    login(); // Privy handles both login and signup flows
  };

  const benefits = [
    "Unlimited repository uploads",
    "Advanced analytics dashboard",
    "Priority customer support",
  ];

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

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Benefits */}
          <div className="hidden md:block">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Start sharing your code today
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of developers who are already showcasing their work
              on RepoMarket.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Signup Card */}
          <Card variant="glass" className="p-8">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(180_70%_45%)] flex items-center justify-center shadow-glow">
                  <span className="text-primary-foreground font-bold">R</span>
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Create your account
              </h1>
              <p className="text-muted-foreground">
                Get started for free, no credit card required
              </p>
            </div>

            <Button
              type="button"
              variant="hero"
              className="w-full"
              size="lg"
              disabled={isLoading}
              onClick={handleSignup}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
