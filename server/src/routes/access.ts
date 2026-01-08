import { Router, Request, Response } from 'express';
import { Access, Project, Purchase } from '../models';
import mongoose from 'mongoose';
import { movementService } from '../services/movement';

const router = Router();

/**
 * GET /api/access/check
 * Check if user has access to a project
 * Checks Purchase table for access status
 * Requirements: 14.1, 14.2
 */
router.get('/check', async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.query;

    if (!projectId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'projectId and userId are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    // Check if user is the owner (always has full access)
    const project = await Project.findById(projectId).lean();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Check if user is owner (handle both ownerId and ownerWalletAddress for backward compatibility)
    const isOwner = project.ownerId?.toString() === userId;

    if (isOwner) {
      return res.json({
        success: true,
        data: {
          hasDemo: true,
          hasDownload: true,
          isOwner: true,
        },
      });
    }

    // Check Purchase table for access
    const purchases = await Purchase.find({
      userId: new mongoose.Types.ObjectId(userId as string),
      projectId: new mongoose.Types.ObjectId(projectId as string),
      status: 'confirmed',
    }).lean();

    const hasDemo = purchases.some(p => p.accessType === 'demo' || p.accessType === 'download');
    const hasDownload = purchases.some(p => p.accessType === 'download');

    return res.json({
      success: true,
      data: {
        hasDemo,
        hasDownload,
        isOwner: false,
      },
    });
  } catch (error) {
    console.error('[Access] Check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check access',
    });
  }
});

/**
 * POST /api/access/grant
 * Grant access to a project (for future payment integration)
 * Now records on-chain tx hash
 * Requirements: 5.2, 5.3
 */
router.post('/grant', async (req: Request, res: Response) => {
  try {
    const { projectId, walletAddress, accessType, txHash, grantTxHash, onChainVerified } = req.body;

    if (!projectId || !walletAddress || !accessType) {
      return res.status(400).json({
        success: false,
        error: 'projectId, walletAddress, and accessType are required',
      });
    }

    if (!['view', 'download'].includes(accessType)) {
      return res.status(400).json({
        success: false,
        error: 'accessType must be "view" or "download"',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    const normalizedWallet = walletAddress.toLowerCase();

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Create or update access record with on-chain tx hash
    const updateData: any = {
      grantedAt: new Date(),
      onChainVerified: onChainVerified !== undefined ? onChainVerified : !!txHash,
    };

    // Add txHash if provided (payment transaction hash)
    if (txHash) {
      updateData.txHash = txHash;
    }

    // Add grantTxHash if provided (access grant transaction hash)
    if (grantTxHash) {
      updateData.grantTxHash = grantTxHash;
    }

    const access = await Access.findOneAndUpdate(
      {
        projectId: new mongoose.Types.ObjectId(projectId),
        walletAddress: normalizedWallet,
        accessType,
      },
      {
        $set: updateData,
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      data: access,
    });
  } catch (error) {
    console.error('[Access] Grant error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to grant access',
    });
  }
});

/**
 * GET /api/access/user/:walletAddress
 * Get all access records for a wallet
 */
router.get('/user/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const normalizedWallet = walletAddress.toLowerCase();

    const accessRecords = await Access.find({ walletAddress: normalizedWallet })
      .populate('projectId', 'title description ownerWalletAddress')
      .sort({ grantedAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: accessRecords,
    });
  } catch (error) {
    console.error('[Access] Get user access error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get access records',
    });
  }
});

router.get("/private-resource", async (req, res) => {
  res.json({
    success: true,
    message: "You paid — welcome 🎉"
  });
});


export default router;
