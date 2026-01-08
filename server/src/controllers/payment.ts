import { Request, Response } from 'express';
import { Transaction, Access, Project, Purchase, User } from '../models';
import { movementService } from '../services/movement';
import {
  PaymentErrorCode,
  createPaymentError,
  mapErrorToPaymentError,
  PaymentErrorException
} from '../errors/payment-errors';
import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Payment initiation request
 */
interface PaymentRequest {
  userId: string;
  projectId: string;
  accessType: 'demo' | 'download';
}

/**
 * Payment initiation response
 */
interface PaymentResponse {
  paymentId: string;
  amount: number;
  recipientAddress: string;
  expiresAt: number;
  projectId: string;
  accessType: 'demo' | 'download';
}

/**
 * Payment verification request
 */
interface VerifyRequest {
  paymentId: string;
  txHash: string;
  userId: string;
}

/**
 * Access response
 */
interface AccessResponse {
  success: boolean;
  accessGranted: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Access status response
 */
interface AccessStatus {
  hasAccess: boolean;
  accessType?: number;
  grantedAt?: Date;
}

/**
 * POST /api/payments/initiate
 * Initiate a payment for repository access
 * 
 * IMPORTANT: Payments go directly to project owners (peer-to-peer marketplace).
 * This ensures creators receive payments immediately without intermediaries.
 * 
 * Requirements: 9.2, 9.3, 10.2, 10.3, 11.1
 */
export async function initiatePayment(req: Request, res: Response): Promise<Response> {
  try {
    console.log('[Payment] ========== INITIATE PAYMENT REQUEST ==========');
    const { userId, projectId, accessType } = req.body as PaymentRequest;
    console.log('[Payment] Request Body:', { userId, projectId, accessType });

    // Validate required fields
    if (!userId || !projectId || !accessType) {
      console.error('[Payment] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'userId, projectId, and accessType are required',
      });
    }

    // Validate access type
    if (!['demo', 'download'].includes(accessType)) {
      console.error('[Payment] Invalid access type:', accessType);
      return res.status(400).json({
        success: false,
        error: 'accessType must be "demo" or "download"',
      });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    // Get project details
    console.log('[Payment] Finding project:', projectId);
    const project = await Project.findById(projectId);
    if (!project) {
      console.error('[Payment] Project not found');
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    console.log('[Payment] Project found:', { title: project.title, ownerId: project.ownerId });

    // Determine price based on access type
    const amount = accessType === 'download' ? project.downloadPrice : project.demoPrice;
    console.log('[Payment] Amount:', amount, 'MOVE for', accessType, 'access');

    // Check for existing purchase
    console.log('[Payment] Checking for existing purchase...');
    const existingPurchase = await Purchase.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      projectId: new mongoose.Types.ObjectId(projectId),
      accessType,
    });

    if (existingPurchase) {
      console.warn('[Payment] User already has access');
      const error = createPaymentError(PaymentErrorCode.ALREADY_HAS_ACCESS);
      return res.status(400).json({
        success: false,
        error: error.userMessage,
        errorCode: error.code,
        actionableSteps: error.actionableSteps,
      });
    }
    console.log('[Payment] No existing purchase found');

    // Generate unique payment ID
    const paymentId = crypto.randomUUID();

    // Get project owner's wallet address
    console.log('[Payment] Finding project owner:', project.ownerId);
    const owner = await User.findById(project.ownerId);
    if (!owner) {
      console.error('[Payment] Project owner not found');
      const error = createPaymentError(PaymentErrorCode.CONTRACT_ERROR, 'Project owner not found');
      return res.status(500).json({
        success: false,
        error: error.userMessage,
        errorCode: error.code,
        actionableSteps: error.actionableSteps,
      });
    }

    const recipientAddress = owner.walletAddress;
    if (!recipientAddress) {
      console.error('[Payment] Project owner wallet not connected');
      const error = createPaymentError(PaymentErrorCode.CONTRACT_ERROR, 'Project owner wallet not connected');
      return res.status(500).json({
        success: false,
        error: error.userMessage,
        errorCode: error.code,
        actionableSteps: error.actionableSteps,
      });
    }
    console.log('[Payment] Recipient address:', recipientAddress);

    // Create pending transaction in MongoDB
    console.log('[Payment] Creating transaction record...');
    const transaction = await Transaction.create({
      fromUserId: new mongoose.Types.ObjectId(userId),
      toUserId: project.ownerId,
      projectId: new mongoose.Types.ObjectId(projectId),
      amount,
      currency: 'MOVE',
      type: accessType === 'download' ? 'download_purchase' : 'demo_purchase',
      status: 'pending',
      chainId: process.env.MOVEMENT_CHAIN_ID || '177',
      paymentId,
      onChainVerified: false,
    });
    console.log('[Payment] Transaction created:', transaction._id);

    // Set expiration time (30 minutes from now)
    const expiresAt = Date.now() + 30 * 60 * 1000;

    const response: PaymentResponse = {
      paymentId,
      amount,
      recipientAddress,
      expiresAt,
      projectId,
      accessType,
    };

    console.log('[Payment] Payment initiated successfully');
    console.log('[Payment] Payment ID:', paymentId);
    console.log('[Payment] ========== INITIATE PAYMENT RESPONSE ==========');
    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[Payment] Initiate error:', error);
    console.error('[Payment] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[Payment] Error type:', error instanceof Error ? error.constructor.name : typeof error);

    const paymentError = mapErrorToPaymentError(error);
    return res.status(500).json({
      success: false,
      error: paymentError.userMessage,
      errorCode: paymentError.code,
      actionableSteps: paymentError.actionableSteps,
      debugInfo: process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      } : undefined,
    });
  }
}


/**
 * POST /api/payments/verify
 * Verify payment transaction and grant on-chain access
 * 
 * IMPORTANT: Verifies payment went to the project owner (not a centralized address).
 * This ensures the marketplace operates as a true peer-to-peer platform.
 * 
 * Requirements: 9.4, 10.4, 11.3, 11.4
 */
export async function verifyAndGrantAccess(req: Request, res: Response): Promise<Response> {
  try {
    console.log('[Payment] ========== VERIFY & GRANT ACCESS ==========');
    const { paymentId, txHash, userId } = req.body as VerifyRequest;
    console.log('[Payment] Verify request:', { paymentId, txHash, userId });

    // Validate required fields
    if (!paymentId || !txHash || !userId) {
      console.error('[Payment] Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'paymentId, txHash, and userId are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('[Payment] Invalid userId format');
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    // Find the pending transaction by paymentId
    console.log('[Payment] Finding pending transaction...');
    const transaction = await Transaction.findOne({
      paymentId,
      fromUserId: new mongoose.Types.ObjectId(userId),
      status: 'pending',
    });

    if (!transaction) {
      console.error('[Payment] Transaction not found or already processed');
      return res.status(404).json({
        success: false,
        error: 'Payment not found or already processed',
      });
    }
    console.log('[Payment] Transaction found:', transaction._id);

    // Get project details for price verification
    const project = await Project.findById(transaction.projectId);
    if (!project) {
      console.error('[Payment] Project not found');
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    console.log('[Payment] Project found:', project.title);

    // Get project owner's wallet address
    const owner = await User.findById(project.ownerId);
    if (!owner || !owner.walletAddress) {
      console.error('[Payment] Project owner wallet not found');
      return res.status(500).json({
        success: false,
        error: 'Project owner wallet not found',
      });
    }

    const recipientAddress = owner.walletAddress;
    console.log('[Payment] Recipient address:', recipientAddress);

    // DEVELOPMENT MODE: Skip blockchain verification
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || process.env.SKIP_BLOCKCHAIN_VERIFICATION === 'true';

    let txDetails;

    if (isDevelopmentMode) {
      console.log('[Payment] ⚠️  DEVELOPMENT MODE: Skipping blockchain verification');
      console.log('[Payment] Accepting transaction without verification');

      // Mock successful transaction
      txDetails = {
        from: transaction.fromUserId.toString(),
        to: recipientAddress,
        amount: transaction.amount.toString(),
        status: 'confirmed' as const,
        blockNumber: Date.now(),
      };
    } else {
      // Verify transaction on Movement blockchain
      console.log('[Payment] Verifying transaction on blockchain...');
      try {
        txDetails = await movementService.verifyTransaction(
          txHash,
          recipientAddress,
          transaction.amount.toString()
        );
        console.log('[Payment] Blockchain verification result:', txDetails);
      } catch (error) {
        console.error('[Payment] Blockchain verification failed:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          success: false,
          error: `Blockchain verification failed: ${errorMsg}`,
        });
      }
    }

    // Check transaction status
    if (txDetails.status === 'pending') {
      console.log('[Payment] Transaction still pending');
      return res.status(202).json({
        success: false,
        accessGranted: false,
        error: 'Transaction is still pending confirmation',
        errorCode: PaymentErrorCode.TX_FAILED,
      });
    }

    if (txDetails.status === 'failed') {
      // Update transaction status to failed
      transaction.status = 'failed';
      transaction.txHash = txHash;
      await transaction.save();

      const error = createPaymentError(PaymentErrorCode.TX_FAILED, 'Transaction failed on blockchain');
      return res.status(400).json({
        success: false,
        accessGranted: false,
        error: error.userMessage,
        errorCode: error.code,
        actionableSteps: error.actionableSteps,
      });
    }

    // Verify amount is sufficient
    const paidAmount = BigInt(txDetails.amount);
    const requiredAmount = BigInt(transaction.amount);

    if (paidAmount < requiredAmount) {
      // Update transaction status to failed
      transaction.status = 'failed';
      transaction.txHash = txHash;
      await transaction.save();

      const error = createPaymentError(
        PaymentErrorCode.INVALID_AMOUNT,
        `Insufficient payment amount. Required: ${requiredAmount}, Paid: ${paidAmount}`
      );
      return res.status(400).json({
        success: false,
        accessGranted: false,
        error: error.userMessage,
        errorCode: error.code,
        actionableSteps: error.actionableSteps,
      });
    }

    // Verify recipient address matches
    if (recipientAddress && txDetails.to !== recipientAddress) {
      transaction.status = 'failed';
      transaction.txHash = txHash;
      await transaction.save();

      const error = createPaymentError(
        PaymentErrorCode.VERIFICATION_FAILED,
        'Payment sent to incorrect recipient address'
      );
      return res.status(400).json({
        success: false,
        accessGranted: false,
        error: error.userMessage,
        errorCode: error.code,
        actionableSteps: error.actionableSteps,
      });
    }

    // Update transaction status to confirmed
    transaction.status = 'confirmed';
    transaction.txHash = txHash;
    transaction.blockNumber = txDetails.blockNumber;
    transaction.onChainVerified = true;
    transaction.confirmedAt = new Date();
    await transaction.save();

    // Create Purchase record
    const accessType = transaction.type === 'download_purchase' ? 'download' : 'demo';
    const purchase = await Purchase.create({
      userId: transaction.fromUserId,
      projectId: transaction.projectId,
      accessType,
      amount: transaction.amount,
      txHash,
      status: 'confirmed',
      purchaseDate: new Date(),
    });

    const response: AccessResponse = {
      success: true,
      accessGranted: true,
      txHash,
    };

    return res.status(200).json({
      success: true,
      data: {
        ...response,
        purchase,
      },
      message: 'Payment verified and access granted',
    });
  } catch (error) {
    console.error('[Payment] Verify and grant access error:', error);
    const paymentError = mapErrorToPaymentError(error);
    return res.status(500).json({
      success: false,
      error: paymentError.userMessage,
      errorCode: paymentError.code,
      actionableSteps: paymentError.actionableSteps,
    });
  }
}


/**
 * GET /api/payments/purchases/:userId
 * Get all purchases for a user
 * Requirements: 5.1-5.4
 */
export async function getUserPurchases(req: Request, res: Response): Promise<Response> {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get all purchases for the user
    const purchases = await Purchase.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'confirmed',
    })
      .populate('projectId', 'title description slug zipFileUrl previewImages')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Purchase.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'confirmed',
    });

    // Separate demo and download purchases
    const demoPurchases = purchases.filter(p => p.accessType === 'demo');
    const downloadPurchases = purchases.filter(p => p.accessType === 'download');

    return res.status(200).json({
      success: true,
      data: {
        purchases,
        demoPurchases,
        downloadPurchases,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('[Payment] Get user purchases error:', error);
    const paymentError = mapErrorToPaymentError(error);
    return res.status(500).json({
      success: false,
      error: paymentError.userMessage,
      errorCode: paymentError.code,
      actionableSteps: paymentError.actionableSteps,
    });
  }
}

/**
 * GET /api/payments/check-access/:projectId
 * Check if user has access to a project (queries on-chain state)
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export async function checkAccess(req: Request, res: Response): Promise<Response> {
  try {
    const { projectId } = req.params;
    const { userAddress } = req.query;

    // Validate required fields
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'userAddress query parameter is required',
      });
    }

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID',
      });
    }

    const normalizedWallet = (userAddress as string).toLowerCase();

    // Check if user is the project owner (always has full access)
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    if (project.ownerWalletAddress === normalizedWallet) {
      const response: AccessStatus = {
        hasAccess: true,
        accessType: 2, // Owner has download access
        grantedAt: project.createdAt,
      };

      return res.status(200).json({
        success: true,
        data: response,
        isOwner: true,
      });
    }

    // Query on-chain access via Movement service
    const repoId = projectId.slice(-8); // Use last 8 chars as numeric ID
    const repoIdNum = parseInt(repoId, 16) % 1000000; // Convert to number

    try {
      const hasAccess = await movementService.hasAccess(normalizedWallet, repoIdNum);

      if (!hasAccess) {
        const response: AccessStatus = {
          hasAccess: false,
        };

        return res.status(200).json({
          success: true,
          data: response,
        });
      }

      // Get access type from on-chain state
      const accessType = await movementService.getAccessType(normalizedWallet, repoIdNum);

      // Get granted date from database if available
      const accessRecord = await Access.findOne({
        projectId: new mongoose.Types.ObjectId(projectId),
        walletAddress: normalizedWallet,
      }).sort({ grantedAt: -1 });

      const response: AccessStatus = {
        hasAccess: true,
        accessType,
        grantedAt: accessRecord?.grantedAt,
      };

      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      // If on-chain query fails, fall back to database
      console.warn('[Payment] On-chain access check failed, falling back to database:', error);

      const accessRecords = await Access.find({
        projectId: new mongoose.Types.ObjectId(projectId),
        walletAddress: normalizedWallet,
      }).sort({ grantedAt: -1 });

      if (accessRecords.length === 0) {
        const response: AccessStatus = {
          hasAccess: false,
        };

        return res.status(200).json({
          success: true,
          data: response,
          fallback: true,
        });
      }

      // Determine highest access level
      const hasDownload = accessRecords.some(a => a.accessType === 'download');
      const accessType = hasDownload ? 2 : 1;

      const response: AccessStatus = {
        hasAccess: true,
        accessType,
        grantedAt: accessRecords[0].grantedAt,
      };

      return res.status(200).json({
        success: true,
        data: response,
        fallback: true,
      });
    }
  } catch (error) {
    console.error('[Payment] Check access error:', error);
    const paymentError = mapErrorToPaymentError(error);
    return res.status(500).json({
      success: false,
      error: paymentError.userMessage,
      errorCode: paymentError.code,
      actionableSteps: paymentError.actionableSteps,
    });
  }
}
