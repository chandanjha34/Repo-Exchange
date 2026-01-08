import { Router, Request, Response } from 'express';
import { User, Project, Purchase, Transaction } from '../models';
import { Types } from 'mongoose';

const router = Router();

/**
 * POST /api/users/register
 * Register a new user with Privy authentication
 * Requirements: 2.5
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { privyId, email, name } = req.body;

    // Validate required fields
    if (!privyId || !email || !name) {
      return res.status(400).json({
        success: false,
        error: 'privyId, email, and name are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ privyId });
    if (existingUser) {
      return res.status(200).json({
        success: true,
        data: {
          userId: existingUser._id.toString(),
          profile: {
            id: existingUser._id.toString(),
            privyId: existingUser.privyId,
            name: existingUser.name,
            email: existingUser.email,
            avatar: existingUser.avatar,
            walletAddress: existingUser.walletAddress,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
          },
        },
        isNew: false,
      });
    }

    // Create new user
    const user = await User.create({
      privyId,
      email: email.toLowerCase(),
      name,
    });

    return res.status(201).json({
      success: true,
      data: {
        userId: user._id.toString(),
        profile: {
          id: user._id.toString(),
          privyId: user.privyId,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      isNew: true,
    });
  } catch (error) {
    console.error('[Users] Register error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to register user',
    });
  }
});

/**
 * POST /api/users/sync
 * Sync user from Privy authentication
 * Creates user if not exists, returns existing user otherwise
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { privyId, walletAddress, email } = req.body;

    // Validate required fields
    if (!privyId || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'privyId and walletAddress are required',
      });
    }

    // Normalize wallet address
    const normalizedWallet = walletAddress.toLowerCase();

    // Find or create user
    let user = await User.findOne({ privyId });

    if (user) {
      // Update wallet address and email if changed
      if (user.walletAddress !== normalizedWallet || user.email !== email) {
        user.walletAddress = normalizedWallet;
        if (email) user.email = email;
        await user.save();
      }
      
      return res.json({
        success: true,
        data: user,
        isNew: false,
      });
    }

    // Create new user
    user = await User.create({
      privyId,
      walletAddress: normalizedWallet,
      email: email || undefined,
    });

    return res.status(201).json({
      success: true,
      data: user,
      isNew: true,
    });
  } catch (error) {
    console.error('[Users] Sync error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync user',
    });
  }
});

/**
 * GET /api/users/:walletAddress
 * Get user by wallet address
 */
router.get('/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    
    // Check if this is a userId (ObjectId) or wallet address
    let user;
    
    if (Types.ObjectId.isValid(walletAddress)) {
      // It's a userId
      const userId = walletAddress;
      user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
      
      // Calculate stats from database
      // Requirements: 3.1, 6.1-6.5
      const [projects, incomingTransactions] = await Promise.all([
        // Total projects created (6.1)
        Project.countDocuments({ ownerId: user._id }),
        
        // Incoming transactions (earnings) (6.2)
        Transaction.find({ 
          toUserId: user._id, 
          status: 'confirmed' 
        }),
      ]);
      
      // Calculate total earnings in MOVE (6.2)
      const totalEarnings = incomingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Get project stats (6.3, 6.4)
      const userProjects = await Project.find({ ownerId: user._id });
      const totalForks = userProjects.reduce((sum, p) => sum + (p.stats?.forks || 0), 0);
      const totalLikes = userProjects.reduce((sum, p) => sum + (p.stats?.likes || 0), 0);
      
      return res.json({
        success: true,
        profile: {
          id: user._id.toString(),
          privyId: user.privyId,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          walletAddress: user.walletAddress,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        stats: {
          totalProjects: projects, // 6.1
          totalEarnings, // 6.2 - in MOVE
          totalForks, // 6.3
          totalLikes, // 6.4
        },
      });
    } else {
      // It's a wallet address (backward compatibility)
      const normalizedWallet = walletAddress.toLowerCase();
      user = await User.findOne({ walletAddress: normalizedWallet });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      return res.json({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.error('[Users] Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
});

/**
 * PUT /api/users/:userId
 * Update user profile (name and avatar only)
 * Requirements: 3.2
 */
router.put('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, avatar } = req.body;

    // Validate userId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Only allow updating name and avatar (Requirement 3.2)
    const updates: any = {};
    if (name !== undefined) {
      updates.name = name;
    }
    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      profile: {
        id: updatedUser!._id.toString(),
        privyId: updatedUser!.privyId,
        name: updatedUser!.name,
        email: updatedUser!.email,
        avatar: updatedUser!.avatar,
        walletAddress: updatedUser!.walletAddress,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Users] Update user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
});

/**
 * POST /api/users/:userId/wallet
 * Connect wallet address to user
 * Requirements: 7.3, 7.4
 */
router.post('/:userId/wallet', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { walletAddress } = req.body;

    // Validate userId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    // Validate wallet address
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required',
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Normalize wallet address
    const normalizedWallet = walletAddress.toLowerCase();

    // Check if wallet is already connected to another user
    const existingWallet = await User.findOne({ 
      walletAddress: normalizedWallet,
      _id: { $ne: userId }
    });
    
    if (existingWallet) {
      return res.status(409).json({
        success: false,
        error: 'Wallet address is already connected to another user',
      });
    }

    // Update only wallet address, do not modify name or email (Requirement 7.3)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { walletAddress: normalizedWallet } },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      profile: {
        id: updatedUser!._id.toString(),
        privyId: updatedUser!.privyId,
        name: updatedUser!.name,
        email: updatedUser!.email,
        avatar: updatedUser!.avatar,
        walletAddress: updatedUser!.walletAddress,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Users] Connect wallet error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to connect wallet',
    });
  }
});

/**
 * DELETE /api/users/:userId/wallet
 * Disconnect wallet from user
 * Requirements: 7.4
 */
router.delete('/:userId/wallet', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID',
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Remove wallet address, keep all other user data (Requirement 7.4)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { walletAddress: '' } },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      profile: {
        id: updatedUser!._id.toString(),
        privyId: updatedUser!.privyId,
        name: updatedUser!.name,
        email: updatedUser!.email,
        avatar: updatedUser!.avatar,
        walletAddress: updatedUser!.walletAddress,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Users] Disconnect wallet error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to disconnect wallet',
    });
  }
});

export default router;
