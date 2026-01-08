import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Transaction status enum
 * Enhanced for Movement blockchain integration
 */
export type TransactionStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'failed'
  | 'broadcasting'
  | 'verifying'
  | 'granting_access';

/**
 * Transaction type enum
 */
export type TransactionType = 'demo_purchase' | 'download_purchase';

/**
 * Transaction interface
 * Tracks on-chain payments for x402 + Movement integration
 */
export interface ITransaction extends Document {
  fromUserId: Types.ObjectId; // Buyer
  toUserId: Types.ObjectId; // Seller
  walletAddress: string; // Deprecated - kept for backward compatibility
  projectId: Types.ObjectId;
  amount: number;
  currency: string;
  txHash?: string;
  status: TransactionStatus;
  type: TransactionType;
  // For Move/x402 integration
  chainId?: string;
  blockNumber?: number;
  // x402 specific fields
  paymentId?: string;
  x402Status?: string;
  // Movement specific fields
  movementTxHash?: string;
  accessGrantTxHash?: string;
  onChainVerified: boolean;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: false, // Made optional for backward compatibility
      index: true,
      lowercase: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    txHash: {
      type: String,
      sparse: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'broadcasting', 'verifying', 'granting_access'],
      default: 'pending',
      index: true,
    },
    type: {
      type: String,
      enum: ['demo_purchase', 'download_purchase'],
      required: true,
    },
    // For future blockchain integration
    chainId: {
      type: String,
    },
    blockNumber: {
      type: Number,
    },
    // x402 specific fields
    paymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    x402Status: {
      type: String,
    },
    // Movement specific fields
    movementTxHash: {
      type: String,
      sparse: true,
    },
    accessGrantTxHash: {
      type: String,
      sparse: true,
    },
    onChainVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    confirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
TransactionSchema.index({ fromUserId: 1, status: 1 }); // Buyer's transactions
TransactionSchema.index({ toUserId: 1, status: 1 }); // Seller's transactions
TransactionSchema.index({ walletAddress: 1, status: 1 }); // Kept for backward compatibility
TransactionSchema.index({ projectId: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
