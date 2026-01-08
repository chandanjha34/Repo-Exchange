import { Router, Request, Response } from 'express';
import { Transaction, Access } from '../models';
import mongoose, { Types } from 'mongoose';

const router = Router();

/**
 * POST /api/transactions
 * Create a new transaction record (for future x402 integration)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      walletAddress,
      projectId,
      amount,
      currency,
      type,
      txHash,
      chainId,
    } = req.body;

    if (!walletAddress || !projectId || amount === undefined || !type) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress, projectId, amount, and type are required',
      });
    }

    if (!['view_purchase', 'download_purchase'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'type must be "view_purchase" or "download_purchase"',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    const transaction = await Transaction.create({
      walletAddress: walletAddress.toLowerCase(),
      projectId: new mongoose.Types.ObjectId(projectId),
      amount,
      currency: currency || 'USD',
      type,
      txHash,
      chainId,
      status: txHash ? 'pending' : 'pending',
    });

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('[Transactions] Create error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create transaction',
    });
  }
});

/**
 * GET /api/transactions/:userId
 * List all user transactions with filtering
 * Requirements: 12.1-12.4
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { type, startDate, endDate, page = '1', limit = '20' } = req.query;

    // Validate userId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    // Build query filter
    const filter: any = {
      $or: [
        { fromUserId: new Types.ObjectId(userId) }, // Outgoing transactions
        { toUserId: new Types.ObjectId(userId) },   // Incoming transactions
      ],
    };

    // Filter by type (incoming/outgoing) - Requirement 12.3
    if (type === 'incoming') {
      delete filter.$or;
      filter.toUserId = new Types.ObjectId(userId);
    } else if (type === 'outgoing') {
      delete filter.$or;
      filter.fromUserId = new Types.ObjectId(userId);
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get transactions with project details - Requirements 12.1, 12.2, 12.4
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('projectId', 'title slug category')
        .populate('fromUserId', 'name email')
        .populate('toUserId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    // Format transactions with type indicator
    const formattedTransactions = transactions.map((tx: any) => {
      const isIncoming = tx.toUserId._id.toString() === userId;
      return {
        id: tx._id.toString(),
        type: isIncoming ? 'incoming' : 'outgoing',
        projectId: tx.projectId._id.toString(),
        projectTitle: tx.projectId.title,
        projectSlug: tx.projectId.slug,
        projectCategory: tx.projectId.category,
        amount: tx.amount,
        transactionType: tx.type, // demo_purchase or download_purchase
        date: tx.createdAt,
        txHash: tx.txHash,
        status: tx.status,
        from: {
          id: tx.fromUserId._id.toString(),
          name: tx.fromUserId.name,
          email: tx.fromUserId.email,
        },
        to: {
          id: tx.toUserId._id.toString(),
          name: tx.toUserId.name,
          email: tx.toUserId.email,
        },
      };
    });

    // Calculate transaction summary - Requirement 6.2
    const allTransactions = await Transaction.find({
      $or: [
        { fromUserId: new Types.ObjectId(userId) },
        { toUserId: new Types.ObjectId(userId) },
      ],
      status: 'confirmed', // Only count confirmed transactions
    }).lean();

    const summary = {
      totalIncoming: 0,
      totalOutgoing: 0,
    };

    allTransactions.forEach((tx: any) => {
      if (tx.toUserId.toString() === userId) {
        // Incoming transaction (earnings)
        summary.totalIncoming += tx.amount;
      } else if (tx.fromUserId.toString() === userId) {
        // Outgoing transaction (purchases)
        summary.totalOutgoing += tx.amount;
      }
    });

    return res.json({
      success: true,
      transactions: formattedTransactions,
      summary, // Requirement 6.2
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[Transactions] Get user transactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get transactions',
    });
  }
});

/**
 * PUT /api/transactions/:id/confirm
 * Confirm a transaction and grant access
 */
router.put('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { txHash, blockNumber } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID',
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    // Update transaction status
    transaction.status = 'confirmed';
    if (txHash) transaction.txHash = txHash;
    if (blockNumber) transaction.blockNumber = blockNumber;
    await transaction.save();

    // Grant access based on transaction type
    const accessType = transaction.type === 'download_purchase' ? 'download' : 'view';
    
    await Access.findOneAndUpdate(
      {
        projectId: transaction.projectId,
        walletAddress: transaction.walletAddress,
        accessType,
      },
      {
        $set: {
          grantedAt: new Date(),
          txHash: transaction.txHash,
          onChainVerified: true,
        },
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      data: transaction,
      message: 'Transaction confirmed and access granted',
    });
  } catch (error) {
    console.error('[Transactions] Confirm error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to confirm transaction',
    });
  }
});

/**
 * GET /api/transactions/user/:walletAddress
 * Get all transactions for a wallet
 */
router.get('/user/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const normalizedWallet = walletAddress.toLowerCase();

    const transactions = await Transaction.find({ walletAddress: normalizedWallet })
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('[Transactions] Get user transactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get transactions',
    });
  }
});

/**
 * GET /api/transactions/project/:projectId
 * Get all transactions for a project (owner only)
 */
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    const transactions = await Transaction.find({ 
      projectId: new mongoose.Types.ObjectId(projectId) 
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('[Transactions] Get project transactions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get transactions',
    });
  }
});

export default router;
