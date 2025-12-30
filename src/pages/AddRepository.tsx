import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  X,
  Plus,
  Image,
  Link as LinkIcon,
  ArrowRight,
} from "lucide-react";

const categories = [
  "SaaS",
  "Dashboard",
  "E-Commerce",
  "AI/ML",
  "Portfolio",
  "Mobile",
  "API",
  "CMS",
];

const licenses = ["MIT", "Apache 2.0", "GPL 3.0", "BSD 3-Clause", "Proprietary"];

const AddRepository = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    category: "",
    license: "",
    demoUrl: "",
    repoUrl: "",
  });
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleAddTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Add New Repository
          </h1>
          <p className="text-muted-foreground">
            Share your project with the community and get discovered
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Repository Name *
                </label>
                <Input
                  placeholder="e.g., Next.js SaaS Starter Kit"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Short Description *
                </label>
                <Input
                  placeholder="A brief summary of your repository (max 150 characters)"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescription: e.target.value })
                  }
                  maxLength={150}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.shortDescription.length}/150 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Long Description
                </label>
                <Textarea
                  placeholder="Provide a detailed description of your repository..."
                  value={formData.longDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, longDescription: e.target.value })
                  }
                  rows={5}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full h-11 rounded-lg border border-border bg-secondary/50 px-4 text-foreground"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    License
                  </label>
                  <select
                    className="w-full h-11 rounded-lg border border-border bg-secondary/50 px-4 text-foreground"
                    value={formData.license}
                    onChange={(e) =>
                      setFormData({ ...formData, license: e.target.value })
                    }
                  >
                    <option value="">Select license</option>
                    {licenses.map((license) => (
                      <option key={license} value={license}>
                        {license}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Tech Stack */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Tech Stack
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add technology (e.g., React, Node.js)"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                />
                <Button type="button" variant="outline" onClick={handleAddTech}>
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <Badge key={tech} variant="tech" className="pl-3 pr-1 py-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Preview Images */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Preview Images
            </h2>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Image className="w-6 h-6 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG or GIF (max 5MB each)
              </p>
            </div>
          </Card>

          {/* Links */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Demo URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://demo.example.com"
                    value={formData.demoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, demoUrl: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Repository / Download URL
                </label>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="https://github.com/... or upload link"
                    value={formData.repoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, repoUrl: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Repository"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddRepository;
