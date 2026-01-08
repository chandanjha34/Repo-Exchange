import mongoose, { Schema, Document } from 'mongoose';

/**
 * User interface
 * Represents users authenticated via Privy
 */
export interface IBounty extends Document {
  company : string;
  logo : string;
  title : string;
  reward : string;
  duration : number;
  difficulty : string;
  category : string;
  tags : string[];
  overview : string;
  objectives : string;
  expectations : string;
  deliverables : string;
  evaluation : string[];
  faq : string[];
  privyId: string;
  walletAddress: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BountySchema = new Schema<IBounty>(
  {
    company: { type: String, required: true },
    logo: { type: String, required: true },
    title: { type: String, required: true },
    reward: { type: String, required: true },
    duration: { type: Number, required: true },
    difficulty: { type: String, required: true },
    category: { type: String, required: true },
    tags: { type: [String], required: true },
    overview: { type: String, required: true },
    objectives: { type: String, required: true },
    expectations: { type: String, required: true },
    deliverables: { type: String, required: true },
    evaluation: { type: [String], required: true },
    faq: { type: [String], required: true },
    privyId: { type: String, required: true},
    walletAddress: { type: String, required: true },
    email: { type: String },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Compound index for efficient lookups
BountySchema.index({ walletAddress: 1, privyId: 1 });

export const Bounty = mongoose.model<IBounty>('Bounty', BountySchema);
