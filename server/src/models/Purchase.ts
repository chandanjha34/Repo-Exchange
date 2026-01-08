import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Access type enum for purchases
 * 'demo' - Paid preview access to view project details
 * 'download' - Paid full access to download project files
 */
export type PurchaseAccessType = 'demo' | 'download';

/**
 * Purchase status enum
 */
export type PurchaseStatus = 'pending' | 'confirmed' | 'failed';

/**
 * Purchase interface
 * Tracks user purchases of project access
 * Links users to projects they've purchased access to
 * Requirements: 9.4, 10.4, 14.1
 */
export interface IPurchase extends Document {
  userId: Types.ObjectId; // Buyer (references User._id)
  projectId: Types.ObjectId; // Project purchased
  accessType: PurchaseAccessType; // Type of access purchased
  amount: number; // Amount paid in MOVE (8 decimals)
  txHash: string; // Blockchain transaction hash
  status: PurchaseStatus; // Purchase status
  purchaseDate: Date; // When purchase was made
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    accessType: {
      type: String,
      enum: ['demo', 'download'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    txHash: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
      index: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - prevents duplicate purchases
// One purchase record per user per project per access type
PurchaseSchema.index(
  { userId: 1, projectId: 1, accessType: 1 },
  { unique: true }
);

// Index for querying user's purchases
PurchaseSchema.index({ userId: 1, purchaseDate: -1 });

// Index for querying project purchases (analytics)
PurchaseSchema.index({ projectId: 1, status: 1 });

// Index for transaction hash lookups (verification)
PurchaseSchema.index({ txHash: 1 });

export const Purchase = mongoose.model<IPurchase>('Purchase', PurchaseSchema);
