import { Link, Navigate } from "react-router-dom";
import { 
  HomepageNavbar, 
  WhySection, 
  RepositoryCardMinimal, 
  MinimalFooter 
} from "@/components/homepage";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";

const Index = () => {
  const { isAuthenticated, ready } = useAuth();
  const { projects: featuredProjects, isLoading } = useProjects({ 
    featured: true, 
    limit: 6 
  });

  // Wait for auth to be ready before redirecting
  if (!ready) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect authenticated users to Explore page
  if (isAuthenticated) {
    return <Navigate to="/repositories" replace />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <HomepageNavbar />

      {/* Hero Section */}
      <section className="w-full bg-black">
        <div className="container mx-auto px-4 py-16 sm:py-20 md:py-28 lg:py-36">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6">
              Discover Premium Code
              <br />
              Repositories
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
              The marketplace for high-quality repositories. Find production-ready templates, 
              UI kits, and starter projects from top developers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/repositories"
                className="w-full sm:w-auto px-6 py-3 bg-white text-black font-medium rounded-sm hover:bg-neutral-200 transition-colors text-center"
              >
                Explore repositories
              </Link>
              <Link
                to="/repositories/new"
                className="w-full sm:w-auto px-6 py-3 border border-white text-white font-medium rounded-sm hover:bg-white hover:text-black transition-colors text-center"
              >
                Add your codebase
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle design element - horizontal line */}
        <div className="container mx-auto px-4">
          <div className="border-t border-neutral-800" />
        </div>
      </section>

      {/* Why Section */}
      <WhySection />

      {/* Featured Repositories Section */}
      <section className="w-full bg-black py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          {/* Section Heading */}
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">
            Featured Repositories
          </h2>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredProjects.map((project) => (
                <RepositoryCardMinimal
                  key={project._id}
                  name={project.title}
                  description={project.shortDescription}
                  author={project.ownerName}
                  slug={project.slug}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-400">
                No featured projects yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-black py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Heading */}
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Share Your Work?
            </h2>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-neutral-400 mb-6 sm:mb-8 px-2">
              Join thousands of developers showcasing their projects on layR. 
              Get discovered, earn recognition, and connect with potential clients.
            </p>

            {/* CTA Button */}
            <Link
              to="/signup"
              className="inline-block px-6 py-3 bg-white text-black font-medium rounded-sm hover:bg-neutral-200 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MinimalFooter />
    </div>
  );
};

export default Index;
