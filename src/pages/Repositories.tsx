import { useState, useEffect } from "react";
import { HomepageNavbar } from "@/components/homepage";
import { Layout } from "@/components/layout";
import { RepositoryCard, categories, techStackFilters } from "@/components/repository";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";

const Repositories = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { projects, isLoading, pagination } = useProjects({
    search: debouncedSearch || undefined,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
  });

  // Filter by tech stack on client side (since it's an array field)
  const filteredProjects = projects.filter((project) => {
    if (selectedTech.length === 0) return true;
    return selectedTech.some((tech) => project.technologies.includes(tech));
  });

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech)
        ? prev.filter((t) => t !== tech)
        : [...prev, tech]
    );
  };

  const content = (
    <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
      {/* Header */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
          Explore Projects
        </h1>
        <p className="text-neutral-400 text-base sm:text-lg">
          Discover {pagination?.total || 0} curated projects from top developers
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="flex gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm sm:text-base focus:outline-none focus:border-neutral-600 rounded-sm"
            />
          </div>
          <button className="shrink-0 p-3 sm:p-3.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors rounded-sm">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex border border-neutral-800 rounded-sm overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3.5 transition-colors ${
                viewMode === "grid" 
                  ? "bg-neutral-800 text-white" 
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3.5 transition-colors ${
                viewMode === "list" 
                  ? "bg-neutral-800 text-white" 
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                selectedCategory === category
                  ? "bg-white text-black"
                  : "bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-600 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tech Stack Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="flex items-center text-sm text-neutral-500 mr-2">
            <Filter className="w-4 h-4 mr-1" />
            Tech:
          </span>
          {techStackFilters.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                selectedTech.includes(tech)
                  ? "bg-neutral-700 text-white border border-neutral-600"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600 hover:text-white"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-sm text-neutral-400">
          Showing {filteredProjects.length} projects
        </p>
        <select className="bg-neutral-900 border border-neutral-800 rounded-sm px-4 py-2 text-sm text-white focus:outline-none focus:border-neutral-600">
          <option>Most Popular</option>
          <option>Recently Added</option>
          <option>Most Stars</option>
          <option>Most Forks</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        }`}>
          {filteredProjects.map((project) => (
            <RepositoryCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-500" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white mb-2">
            No projects found
          </h3>
          <p className="text-neutral-400 mb-6">
            {projects.length === 0 
              ? "No projects have been added yet. Be the first to add one!"
              : "Try adjusting your search or filter criteria"}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedTech([]);
            }}
            className="px-6 py-2.5 border border-white text-white font-medium rounded-sm hover:bg-white hover:text-black transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  // If authenticated, use Layout (with Header), otherwise use HomepageNavbar
  if (isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-black">
          {content}
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <HomepageNavbar />
      {content}
    </div>
  );
};

export default Repositories;
