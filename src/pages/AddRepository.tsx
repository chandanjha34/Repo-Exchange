import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { projectApi } from "@/lib/api";
import { useWallet } from "@/hooks/useWallet";
import {
  X,
  Plus,
  Image,
  Link as LinkIcon,
  FileArchive,
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
  const { address } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    category: "",
    license: "",
    demoUrl: "",
  });
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [pricing, setPricing] = useState({
    forkPrice: "",
    viewPrice: "",
  });

  const handleAddTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        alert('Please upload a .zip file');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('ZIP file must be under 20MB');
        return;
      }
      setZipFile(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (previewImages.length + files.length > 5) {
      alert('You can upload a maximum of 5 images');
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 1024 * 1024) {
        alert(`${file.name} exceeds 1MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    setPreviewImages([...previewImages, ...validFiles]);
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!address) {
      setError("Please connect your wallet first");
      setIsSubmitting(false);
      return;
    }

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      const response = await projectApi.create({
        title: formData.name,
        slug,
        shortDescription: formData.shortDescription,
        description: formData.longDescription || formData.shortDescription,
        ownerWalletAddress: address,
        ownerName: `${address.slice(0, 6)}...${address.slice(-4)}`,
        technologies: techStack,
        category: formData.category || 'Other',
        demoUrl: formData.demoUrl || undefined,
        priceView: parseFloat(pricing.viewPrice) || 0,
        priceDownload: parseFloat(pricing.forkPrice) || 0,
        isPublished: true,
      });

      if (response.success) {
        navigate("/profile/me");
      } else {
        setError(response.error || "Failed to create project");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="container max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8 sm:mb-10">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
              Add New Project
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base">
              Share your project with the community and get discovered
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Wallet Warning */}
            {!address && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-sm p-4">
                <p className="text-yellow-400 text-sm">Please connect your wallet to add a project.</p>
              </div>
            )}

            {/* Basic Info */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              
              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Next.js SaaS Starter Kit"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Short Description *
                    </label>
                    <input
                      type="text"
                      placeholder="A brief summary of your project (max 150 characters)"
                      value={formData.shortDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, shortDescription: e.target.value })
                      }
                      maxLength={150}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
                      required
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      {formData.shortDescription.length}/150 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Long Description
                    </label>
                    <textarea
                      placeholder="Provide a detailed description of your project..."
                      value={formData.longDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, longDescription: e.target.value })
                      }
                      rows={5}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Category *
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-600 rounded-sm"
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
                      <label className="block text-sm font-medium text-white mb-2">
                        License
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-neutral-600 rounded-sm"
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
              </div>
            </div>

            {/* Technologies Used */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              
              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Technologies Used
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add technology (e.g., React, Node.js)"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                      className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddTech}
                      className="px-4 py-2.5 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors rounded-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => (
                        <span key={tech} className="px-3 py-1.5 bg-neutral-800 text-white text-sm rounded-sm flex items-center gap-2">
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(tech)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Images */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              
              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Preview Images
                </h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-neutral-700 rounded-sm p-8 text-center hover:border-neutral-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <Image className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-medium mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-neutral-400">
                        PNG, JPG or GIF (max 1MB each, up to 5 images)
                      </p>
                      <p className="text-xs text-neutral-500 mt-2">
                        {previewImages.length}/5 images uploaded
                      </p>
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {previewImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-neutral-800 rounded-sm overflow-hidden border border-neutral-700">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-neutral-400 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              
              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Links
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Demo URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="url"
                        placeholder="https://demo.example.com"
                        value={formData.demoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, demoUrl: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Code ZIP */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              
              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Upload Project Code
                </h2>
                <div className="border-2 border-dashed border-neutral-700 rounded-sm p-8 text-center hover:border-neutral-600 transition-colors">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    className="hidden"
                    id="zip-upload"
                  />
                  <label htmlFor="zip-upload" className="cursor-pointer">
                    <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-4">
                      <FileArchive className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white font-medium mb-1">
                      {zipFile ? zipFile.name : "Click to upload ZIP file"}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Upload your project code as a .zip file (max 20MB)
                    </p>
                  </label>
                  {zipFile && (
                    <button
                      type="button"
                      onClick={() => setZipFile(null)}
                      className="mt-4 px-4 py-2 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors rounded-sm text-sm inline-flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove file
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
              
              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Pricing (USD)
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Fork Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={pricing.forkPrice}
                        onChange={(e) =>
                          setPricing({ ...pricing, forkPrice: e.target.value })
                        }
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
                        required
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Price for users to fork your project
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      View Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={pricing.viewPrice}
                        onChange={(e) =>
                          setPricing({ ...pricing, viewPrice: e.target.value })
                        }
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
                        required
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Price for users to view your project code
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit - Centered */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors rounded-sm text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddRepository;
