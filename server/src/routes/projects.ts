import { Router, Request, Response } from 'express';
import { Project } from '../models';
import mongoose from 'mongoose';

const router = Router();

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      shortDescription,
      description,
      ownerWalletAddress,
      ownerName,
      ownerAvatar,
      priceView,
      priceDownload,
      technologies,
      category,
      images,
      previewImage,
      zipFileUrl,
      demoUrl,
      isPublished,
      isFeatured,
    } = req.body;

    // Validate required fields
    if (!title || !slug || !shortDescription || !description || !ownerWalletAddress || !ownerName) {
      return res.status(400).json({
        success: false,
        error: 'title, slug, shortDescription, description, ownerWalletAddress, and ownerName are required',
      });
    }

    // Check if slug already exists
    const existingProject = await Project.findOne({ slug: slug.toLowerCase() });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        error: 'A project with this slug already exists',
      });
    }

    const project = await Project.create({
      title,
      slug: slug.toLowerCase(),
      shortDescription,
      description,
      ownerWalletAddress: ownerWalletAddress.toLowerCase(),
      ownerName,
      ownerAvatar,
      priceView: priceView || 0,
      priceDownload: priceDownload || 0,
      technologies: technologies || [],
      category: category || 'Other',
      images: images || [],
      previewImage,
      zipFileUrl,
      demoUrl,
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      stars: 0,
      forks: 0,
      downloads: 0,
    });

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('[Projects] Create error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create project',
    });
  }
});

/**
 * GET /api/projects
 * List all published projects with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const ownerWallet = req.query.owner as string;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const featured = req.query.featured as string;

    // Build query
    const query: Record<string, unknown> = { isPublished: true };
    
    if (ownerWallet) {
      query.ownerWalletAddress = ownerWallet.toLowerCase();
      // Show unpublished projects for owner
      delete query.isPublished;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Projects] List error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to list projects',
    });
  }
});

/**
 * GET /api/projects/slug/:slug
 * Get project by slug
 */
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({ slug: slug.toLowerCase() }).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('[Projects] Get by slug error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get project',
    });
  }
});

/**
 * GET /api/projects/:id
 * Get project details by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    const project = await Project.findById(id).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('[Projects] Get error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get project',
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update project (owner only)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ownerWalletAddress, ...updates } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    if (!ownerWalletAddress) {
      return res.status(400).json({
        success: false,
        error: 'ownerWalletAddress is required for authorization',
      });
    }

    const project = await Project.findOneAndUpdate(
      { 
        _id: id, 
        ownerWalletAddress: ownerWalletAddress.toLowerCase() 
      },
      { $set: updates },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or unauthorized',
      });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('[Projects] Update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project (owner only)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerWalletAddress = req.query.owner as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    if (!ownerWalletAddress) {
      return res.status(400).json({
        success: false,
        error: 'owner query param is required for authorization',
      });
    }

    const project = await Project.findOneAndDelete({
      _id: id,
      ownerWalletAddress: ownerWalletAddress.toLowerCase(),
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or unauthorized',
      });
    }

    return res.json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    console.error('[Projects] Delete error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
});

export default router;
