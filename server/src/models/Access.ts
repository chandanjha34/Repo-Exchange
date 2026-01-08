import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Access type enum
 */
export type AccessType = 'view' | 'download';

/**
 * Access interface
 * Tracks which wallet has access to which project
 * Synced with Move on-chain access contract
 */
export interface IAccess extends Document {
  projectId: Types.ObjectId;
  walletAddress: string;
  accessType: AccessType;
  grantedAt: Date;
  // Movement blockchain integration
  txHash?: string;
  onChainVerified: boolean;
  contractAddress?: string;
  grantTxHash?: string;
  transactionId?: Types.ObjectId;
}

const AccessSchema = new Schema<IAccess>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    accessType: {
      type: String,
      enum: ['view', 'download'],
      required: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    // Movement blockchain verification
    txHash: {
      type: String,
      sparse: true,
    },
    onChainVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    contractAddress: {
      type: String,
    },
    grantTxHash: {
      type: String,
      sparse: true,
      index: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - one access record per wallet per project per type
AccessSchema.index(
  { projectId: 1, walletAddress: 1, accessType: 1 },
  { unique: true }
);

// Index for checking user's access across projects
AccessSchema.index({ walletAddress: 1, accessType: 1 });

export const Access = mongoose.model<IAccess>('Access', AccessSchema);
