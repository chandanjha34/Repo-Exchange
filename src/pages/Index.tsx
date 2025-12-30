import { Link } from "react-router-dom";
import { 
  HomepageNavbar, 
  WhySection, 
  RepositoryCardMinimal, 
  MinimalFooter 
} from "@/components/homepage";

// Featured repository data for the homepage
interface FeaturedRepo {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
}

const featuredRepos: FeaturedRepo[] = [
  {
    id: "1",
    slug: "nextjs-saas-starter",
    name: "Next.js SaaS Starter",
    description: "Production-ready SaaS template with authentication, billing, and dashboard.",
    author: "Sarah Chen"
  },
  {
    id: "2",
    slug: "react-dashboard-kit",
    name: "React Dashboard Kit",
    description: "Modern admin dashboard with charts, tables, and dark mode support.",
    author: "Alex Rivera"
  },
  {
    id: "3",
    slug: "tailwind-ui-components",
    name: "Tailwind UI Components",
    description: "50+ accessible components built with Tailwind CSS and React.",
    author: "Jordan Lee"
  },
  {
    id: "4",
    slug: "node-api-boilerplate",
    name: "Node API Boilerplate",
    description: "Express.js REST API with TypeScript, authentication, and testing setup.",
    author: "Morgan Smith"
  },
  {
    id: "5",
    slug: "vue-ecommerce-template",
    name: "Vue E-commerce Template",
    description: "Full-featured e-commerce frontend with cart, checkout, and payments.",
    author: "Casey Kim"
  },
  {
    id: "6",
    slug: "python-ml-starter",
    name: "Python ML Starter",
    description: "Machine learning project template with data pipelines and model serving.",
    author: "Taylor Wong"
  }
];

const Index = () => {
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

          {/* Repository Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredRepos.map((repo) => (
              <RepositoryCardMinimal
                key={repo.id}
                name={repo.name}
                description={repo.description}
                author={repo.author}
                slug={repo.slug}
              />
            ))}
          </div>
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
