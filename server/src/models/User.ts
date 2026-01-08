import mongoose, { Schema, Document } from 'mongoose';

/**
 * User interface
 * Represents users authenticated via Privy
 * User profile is based on Privy authentication, not wallet address
 * Wallet connection is optional and used for payments only
 */
export interface IUser extends Document {
  privyId: string; // Unique identifier from Privy
  name: string; // User's display name
  email: string; // User's email address
  avatar?: string; // Optional avatar URL
  walletAddress?: string; // Optional wallet address for payments only
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    privyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    walletAddress: {
      type: String,
      required: false,
      index: true,
      sparse: true, // Sparse index for optional field
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
