import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { projectApi } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Plus,
  Image,
  Link as LinkIcon,
  FileArchive,
  CheckCircle2,
  ExternalLink,
  LayoutDashboard,
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
  const { userId, userProfile } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProject, setCreatedProject] = useState<{ slug: string; title: string } | null>(null);
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
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [pricing, setPricing] = useState({
    demoPrice: "",
    downloadPrice: "",
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

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Thumbnail must be under 5MB');
        return;
      }
      setThumbnail(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    console.log('[AddRepository] Form submission started');

    // Check if user is authenticated
    if (!userId) {
      const errorMsg = "Please log in to create a project";
      console.error('[AddRepository] User not authenticated');
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    console.log('[AddRepository] User authenticated:', { userId, userName: userProfile?.name });

    // Validate pricing
    const demoPriceNum = parseFloat(pricing.demoPrice) || 0;
    const downloadPriceNum = parseFloat(pricing.downloadPrice) || 0;

    if (downloadPriceNum < demoPriceNum) {
      const errorMsg = "Download price must be greater than or equal to demo price";
      console.error('[AddRepository] Pricing validation failed:', { demoPriceNum, downloadPriceNum });
      setError(errorMsg);
      setIsSubmitting(false);
      return;
    }

    // Generate slug from name
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Convert thumbnail to base64 if present
    let thumbnailBase64: string | undefined;
    if (thumbnail) {
      try {
        thumbnailBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(thumbnail);
        });
        console.log('[AddRepository] Thumbnail converted to base64');
      } catch (err) {
        console.error('[AddRepository] Failed to convert thumbnail:', err);
      }
    }

    // Convert ZIP file to base64 if present
    let zipFileBase64: string | undefined;
    if (zipFile) {
      try {
        zipFileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(zipFile);
        });
        console.log('[AddRepository] ZIP file converted to base64');
      } catch (err) {
        console.error('[AddRepository] Failed to convert ZIP file:', err);
      }
    }

    const projectData = {
      title: formData.name,
      slug,
      shortDescription: formData.shortDescription,
      description: formData.longDescription || formData.shortDescription,
      userId: userId,
      ownerName: userProfile?.name || 'Anonymous',
      ownerAvatar: userProfile?.avatar,
      technologies: techStack,
      category: formData.category || 'Other',
      demoUrl: formData.demoUrl || undefined,
      previewImage: thumbnailBase64,
      zipFileData: zipFileBase64, // Include ZIP file data
      demoPrice: demoPriceNum,
      downloadPrice: downloadPriceNum,
      isPublished: true,
    };

    console.log('[AddRepository] Submitting project with data:', projectData);

    try {
      const response = await projectApi.create(projectData);

      console.log('[AddRepository] API Response:', response);

      if (response.success) {
        console.log('[AddRepository] Project created successfully:', response.data);
        // Show success modal instead of navigating immediately
        setCreatedProject({
          slug: response.data.slug,
          title: response.data.title,
        });
        setShowSuccessModal(true);
      } else {
        console.error('[AddRepository] API returned error:', response.error);

        // Check if error is due to missing wallet
        if (response.requiresWallet || response.error?.includes('Wallet connection required')) {
          const errorMsg = 'You must connect your Movement wallet before creating a project';
          setError(errorMsg);
          toast({
            title: 'Wallet Required',
            description: 'Please connect your Movement wallet in your profile to enable payments.',
            variant: 'destructive',
          });
          // Redirect to profile after a delay to connect wallet
          setTimeout(() => {
            navigate('/profile/me');
          }, 3000);
        } else {
          setError(response.error || "Failed to create project");
        }
      }
    } catch (err) {
      console.error('[AddRepository] Exception caught:', err);
      console.error('[AddRepository] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F0D] via-[#050A08] to-black">
        <div className="container max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8 sm:mb-10">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
              Add New Project
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Share your project with the community and get discovered
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Authentication Warning */}
            {!userId && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <p className="text-emerald-400 text-sm">Please log in to add a project.</p>
              </div>
            )}

            {/* Basic Info */}
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg pointer-events-none" />

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
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
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
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
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
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg resize-none transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Category *
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        required
                      >
                        <option value="" className="bg-[#0A0F0D]">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat} className="bg-[#0A0F0D]">
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
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
                        value={formData.license}
                        onChange={(e) =>
                          setFormData({ ...formData, license: e.target.value })
                        }
                      >
                        <option value="" className="bg-[#0A0F0D]">Select license</option>
                        {licenses.map((license) => (
                          <option key={license} value={license} className="bg-[#0A0F0D]">
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
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg pointer-events-none" />

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
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddTech}
                      className="px-4 py-2.5 border border-white/10 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-colors rounded-lg flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => (
                        <span key={tech} className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg flex items-center gap-2">
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

            {/* Project Thumbnail */}
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg pointer-events-none" />

              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Project Thumbnail
                </h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                        <Image className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-white font-medium mb-1">
                        Upload project thumbnail
                      </p>
                      <p className="text-sm text-gray-400">
                        PNG or JPG (max 5MB, recommended: 1200x630px)
                      </p>
                    </label>
                  </div>

                  {thumbnailPreview && (
                    <div className="relative">
                      <div className="aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10 max-w-md mx-auto">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnail(null);
                          setThumbnailPreview('');
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        {thumbnail?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Images */}
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg pointer-events-none" />

              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Preview Images
                </h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                        <Image className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-white font-medium mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-400">
                        PNG, JPG or GIF (max 1MB each, up to 5 images)
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {previewImages.length}/5 images uploaded
                      </p>
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {previewImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-gray-400 mt-1 truncate">
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
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg pointer-events-none" />

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
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="url"
                        placeholder="https://demo.example.com"
                        value={formData.demoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, demoUrl: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Code ZIP */}
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg pointer-events-none" />

              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Upload Project Code
                </h2>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    className="hidden"
                    id="zip-upload"
                  />
                  <label htmlFor="zip-upload" className="cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <FileArchive className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-white font-medium mb-1">
                      {zipFile ? zipFile.name : "Click to upload ZIP file"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Upload your project code as a .zip file (max 20MB)
                    </p>
                  </label>
                  {zipFile && (
                    <button
                      type="button"
                      onClick={() => setZipFile(null)}
                      className="mt-4 px-4 py-2 border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg text-sm inline-flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove file
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-lg pointer-events-none" />

              <div className="relative">
                <h2 className="font-heading text-xl font-semibold text-white mb-6">
                  Pricing (MOVE)
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Demo Price *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={pricing.demoPrice}
                        onChange={(e) =>
                          setPricing({ ...pricing, demoPrice: e.target.value })
                        }
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Price for users to view demo/preview of your project
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Download Price *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={pricing.downloadPrice}
                        onChange={(e) =>
                          setPricing({ ...pricing, downloadPrice: e.target.value })
                        }
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-lg transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Price for users to download your full project (must be ≥ demo price)
                    </p>
                  </div>
                </div>
                {pricing.demoPrice && pricing.downloadPrice && parseFloat(pricing.downloadPrice) < parseFloat(pricing.demoPrice) && (
                  <p className="text-xs text-red-400 mt-2">
                    ⚠ Download price must be greater than or equal to demo price
                  </p>
                )}
              </div>
            </div>

            {/* Submit - Centered */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? "Submitting..." : "Submit Project"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-neutral-900 border-emerald-500/20 text-white">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <DialogTitle className="text-2xl font-heading text-center">
              🎉 Project Published!
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-center">
              Your project <span className="text-white font-medium">"{createdProject?.title}"</span> is now live and visible to the community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            <Link to={`/repositories/${createdProject?.slug}`} className="block">
              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-semibold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded-full"
                onClick={() => setShowSuccessModal(false)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Your Project
              </Button>
            </Link>

            <Link to="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-full"
                onClick={() => setShowSuccessModal(false)}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AddRepository;