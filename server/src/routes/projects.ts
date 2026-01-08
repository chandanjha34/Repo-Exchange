import { Router, Request, Response } from 'express';
import { Project, User } from '../models';
import mongoose from 'mongoose';

const router = Router();

/**
 * POST /api/projects
 * Create a new project
 * Requirements: 8.1, 8.2, 8.3, 18.1-18.5
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('[Projects] Create request received');
    console.log('[Projects] Request body keys:', Object.keys(req.body));

    const {
      title,
      slug,
      shortDescription,
      description,
      userId, // Changed from ownerWalletAddress
      ownerName,
      ownerAvatar,
      demoPrice, // Changed from priceView
      downloadPrice, // Changed from priceDownload
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
    if (!title || !slug || !shortDescription || !description || !userId) {
      console.log('[Projects] Missing required fields:', {
        title: !!title,
        slug: !!slug,
        shortDescription: !!shortDescription,
        description: !!description,
        userId: !!userId,
      });
      return res.status(400).json({
        success: false,
        error: 'title, slug, shortDescription, description, and userId are required',
        missing: {
          title: !title,
          slug: !slug,
          shortDescription: !shortDescription,
          description: !description,
          userId: !userId,
        },
      });
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('[Projects] Invalid userId format:', userId);
      return res.status(400).json({
        success: false,
        error: 'Invalid userId',
      });
    }

    // Validate pricing (Requirement 8.1, 8.2, 8.3)
    console.log('[Projects] Received prices:', { demoPrice, downloadPrice, types: { demo: typeof demoPrice, download: typeof downloadPrice } });
    const demo = typeof demoPrice === 'number' ? demoPrice : 0;
    const download = typeof downloadPrice === 'number' ? downloadPrice : 0;
    console.log('[Projects] Parsed prices:', { demo, download });

    if (demo < 0 || download < 0) {
      console.log('[Projects] Negative pricing:', { demo, download });
      return res.status(400).json({
        success: false,
        error: 'Prices cannot be negative',
      });
    }

    // Requirement 8.3: Validate that download price >= demo price
    if (download < demo) {
      console.log('[Projects] Invalid pricing relationship:', { demo, download });
      return res.status(400).json({
        success: false,
        error: 'Download price must be greater than or equal to demo price',
      });
    }

    // Check if slug already exists
    const existingProject = await Project.findOne({ slug: slug.toLowerCase() });
    if (existingProject) {
      console.log('[Projects] Slug already exists:', slug);
      return res.status(400).json({
        success: false,
        error: 'A project with this slug already exists',
      });
    }

    console.log('[Projects] Creating project with data:', {
      title,
      slug,
      userId,
      ownerName,
      category: category || 'Other',
    });

    // IMPORTANT: Check if user has connected their wallet
    // Projects require owner wallet to receive payments
    console.log('[Projects] Checking if user has wallet connected...');
    const projectOwner = await User.findById(userId);
    if (!projectOwner) {
      console.error('[Projects] User not found:', userId);
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!projectOwner.walletAddress) {
      console.warn('[Projects] User attempted to create project without wallet');
      return res.status(400).json({
        success: false,
        error: 'Wallet connection required',
        message: 'You must connect your Movement wallet before creating a project. This allows you to receive payments from buyers.',
        requiresWallet: true,
      });
    }
    console.log('[Projects] User has wallet connected:', projectOwner.walletAddress);

    const project = await Project.create({
      title,
      slug: slug.toLowerCase(),
      shortDescription,
      description,
      ownerId: userId, // Link to userId instead of wallet
      ownerName,
      ownerAvatar,
      demoPrice: demo,
      downloadPrice: download,
      technologies: technologies || [],
      category: category || 'Other',
      images: images || [],
      previewImage,
      zipFileUrl,
      demoUrl,
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      stats: {
        likes: 0,
        forks: 0,
        downloads: 0,
        views: 0,
      },
    });

    console.log('[Projects] Project created successfully:', {
      id: project._id,
      title: project.title,
      slug: project.slug,
    });

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('[Projects] Create error:', error);
    console.error('[Projects] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({
      success: false,
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/projects
 * List all published projects with pagination
 * Requirements: 17.3
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const ownerWallet = req.query.owner as string;
    const ownerId = req.query.ownerId as string;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const featured = req.query.featured as string;

    // Price range filtering (Requirement 17.3)
    const minDemoPrice = req.query.minDemoPrice ? parseFloat(req.query.minDemoPrice as string) : undefined;
    const maxDemoPrice = req.query.maxDemoPrice ? parseFloat(req.query.maxDemoPrice as string) : undefined;
    const minDownloadPrice = req.query.minDownloadPrice ? parseFloat(req.query.minDownloadPrice as string) : undefined;
    const maxDownloadPrice = req.query.maxDownloadPrice ? parseFloat(req.query.maxDownloadPrice as string) : undefined;

    // Build query
    const query: Record<string, unknown> = { isPublished: true };

    // Support both old (wallet) and new (userId) owner filtering
    if (ownerId) {
      if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ownerId',
        });
      }
      query.ownerId = ownerId;
      // Show unpublished projects for owner
      delete query.isPublished;
    } else if (ownerWallet) {
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

    // Price range filtering
    if (minDemoPrice !== undefined || maxDemoPrice !== undefined) {
      query.demoPrice = {};
      if (minDemoPrice !== undefined) {
        (query.demoPrice as Record<string, unknown>).$gte = minDemoPrice;
      }
      if (maxDemoPrice !== undefined) {
        (query.demoPrice as Record<string, unknown>).$lte = maxDemoPrice;
      }
    }

    if (minDownloadPrice !== undefined || maxDownloadPrice !== undefined) {
      query.downloadPrice = {};
      if (minDownloadPrice !== undefined) {
        (query.downloadPrice as Record<string, unknown>).$gte = minDownloadPrice;
      }
      if (maxDownloadPrice !== undefined) {
        (query.downloadPrice as Record<string, unknown>).$lte = maxDownloadPrice;
      }
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    // Filter out projects where owner doesn't have wallet (can't purchase)
    // This prevents showing projects that can't be bought
    console.log('[Projects] Filtering projects by owner wallet status...');
    const purchaseableProjects = [];

    for (const project of projects) {
      const owner = await User.findById(project.ownerId);
      if (owner && owner.walletAddress) {
        purchaseableProjects.push(project);
      } else {
        console.log(`[Projects] Hiding project "${project.title}" - owner has no wallet`);
      }
    }

    console.log(`[Projects] Showing ${purchaseableProjects.length} of ${projects.length} projects`);

    return res.json({
      success: true,
      data: purchaseableProjects,
      pagination: {
        page,
        limit,
        total: purchaseableProjects.length, // Adjusted total
        pages: Math.ceil(purchaseableProjects.length / limit),
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
 * Requirements: 8.4, 14.1
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string; // Optional: for access checking

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

    // Check user's access for both types (Requirement 14.1)
    let hasAccess = {
      demo: false,
      download: false,
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      // Import Purchase model
      const { Purchase } = await import('../models');

      // Check for demo access
      const demoPurchase = await Purchase.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        projectId: new mongoose.Types.ObjectId(id),
        accessType: 'demo',
        status: 'confirmed',
      });

      // Check for download access
      const downloadPurchase = await Purchase.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        projectId: new mongoose.Types.ObjectId(id),
        accessType: 'download',
        status: 'confirmed',
      });

      hasAccess = {
        demo: !!demoPurchase,
        download: !!downloadPurchase,
      };
    }

    return res.json({
      success: true,
      data: {
        ...project,
        hasAccess, // Include access information
      },
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
 * GET /api/projects/:id/analytics
 * Get detailed analytics for a project (owner only)
 * Requirements: 16.1-16.5
 */
router.get('/:id/analytics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid userId is required for authorization',
      });
    }

    // Check if user is the owner
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    if (project.ownerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Only project owner can view analytics',
      });
    }

    // Import Purchase and Transaction models
    const { Purchase, Transaction } = await import('../models');

    // Get all confirmed purchases for this project
    const purchases = await Purchase.find({
      projectId: new mongoose.Types.ObjectId(id),
      status: 'confirmed',
    })
      .populate('userId', 'name email avatar')
      .sort({ purchaseDate: -1 })
      .lean();

    // Calculate analytics
    const demoPurchases = purchases.filter(p => p.accessType === 'demo');
    const downloadPurchases = purchases.filter(p => p.accessType === 'download');

    // Calculate total revenue from transactions
    const transactions = await Transaction.find({
      projectId: new mongoose.Types.ObjectId(id),
      toUserId: new mongoose.Types.ObjectId(userId),
      status: 'confirmed',
    }).lean();

    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Format purchaser list with details
    const purchasers = purchases.map(purchase => ({
      userId: purchase.userId,
      accessType: purchase.accessType,
      date: purchase.purchaseDate,
      amount: purchase.amount,
      txHash: purchase.txHash,
    }));

    return res.json({
      success: true,
      data: {
        totalRevenue, // Requirement 16.1
        demoPurchases: demoPurchases.length, // Requirement 16.2
        downloadPurchases: downloadPurchases.length, // Requirement 16.3
        purchasers, // Requirement 16.4
        // Additional useful stats
        totalPurchases: purchases.length,
        uniquePurchasers: new Set(purchases.map(p => p.userId.toString())).size,
      },
    });
  } catch (error) {
    console.error('[Projects] Analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get project analytics',
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
