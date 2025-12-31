import mongoose, { Schema, Document } from 'mongoose';

/**
 * Project interface
 * Represents a codebase uploaded by a developer
 */
export interface IProject extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  ownerWalletAddress: string;
  ownerName: string;
  ownerAvatar?: string;
  priceView: number;
  priceDownload: number;
  isPublished: boolean;
  isFeatured: boolean;
  technologies: string[];
  category: string;
  images: string[];
  previewImage?: string;
  zipFileUrl?: string;
  demoUrl?: string;
  stars: number;
  forks: number;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    ownerWalletAddress: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerAvatar: {
      type: String,
    },
    priceView: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    priceDownload: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    technologies: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      default: 'Other',
    },
    images: {
      type: [String],
      default: [],
    },
    previewImage: {
      type: String,
    },
    zipFileUrl: {
      type: String,
    },
    demoUrl: {
      type: String,
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
ProjectSchema.index({ isPublished: 1, createdAt: -1 });
ProjectSchema.index({ isPublished: 1, isFeatured: 1, createdAt: -1 });
ProjectSchema.index({ ownerWalletAddress: 1, createdAt: -1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ title: 'text', shortDescription: 'text', description: 'text' });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
