import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RepositoryCard, mockRepositories, categories, techStackFilters } from "@/components/repository";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";

const Repositories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredRepos = mockRepositories.filter((repo) => {
    const matchesSearch = 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || repo.category === selectedCategory;
    
    const matchesTech = 
      selectedTech.length === 0 || 
      selectedTech.some((tech) => repo.techStack.includes(tech));
    
    return matchesSearch && matchesCategory && matchesTech;
  });

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech)
        ? prev.filter((t) => t !== tech)
        : [...prev, tech]
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Explore Repositories
          </h1>
          <p className="text-muted-foreground">
            Discover {mockRepositories.length}+ curated repositories from top developers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
            <Button variant="outline" size="icon-lg" className="shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon-lg"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon-lg"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Tech Stack Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center text-sm text-muted-foreground mr-2">
              <Filter className="w-4 h-4 mr-1" />
              Tech:
            </span>
            {techStackFilters.map((tech) => (
              <Badge
                key={tech}
                variant={selectedTech.includes(tech) ? "tech" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => toggleTech(tech)}
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredRepos.length} repositories
          </p>
          <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            <option>Most Popular</option>
            <option>Recently Added</option>
            <option>Most Stars</option>
            <option>Most Forks</option>
          </select>
        </div>

        {/* Repository Grid */}
        {filteredRepos.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}>
            {filteredRepos.map((repo) => (
              <RepositoryCard key={repo.id} repository={repo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No repositories found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedTech([]);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Repositories;
