import mongoose, { Schema, Document } from 'mongoose';

/**
 * User interface
 * Represents users authenticated via Privy
 */
export interface IApplicants extends Document {
  TeamName : string,
  TeamMembers: string[],
  BountyId: string,
  walletAddress: string,
  RepositoryLink : string,
  LiveDemoURL : string,
  ProductOverview : string,
  TechnicalArchitecture : string,
  HiringDemand : string,
  github: string,
  linkedin: string,
  twitter: string,
  website: string,
  other: string,
  status: string,
  createdAt: Date,
  updatedAt: Date,
}


const ApplicantsSchema = new Schema<IApplicants>(
  {
    TeamName : {type: String, required: true},
    TeamMembers: {type: [String], required: true},
    BountyId: {type: String, required: true},
    walletAddress: {type: String, required: true},
    RepositoryLink : {type: String, required: true},
    LiveDemoURL : {type: String, required: true},
    ProductOverview : {type: String, required: true},
    TechnicalArchitecture : {type: String, required: true},
    HiringDemand : {type: String, required: true},
    github: {type: String, required: true},
    linkedin: {type: String, required: true},
    twitter: {type: String, required: true},
    website: {type: String, required: true},
    other: {type: String, required: true},
    status: {type: String, required: true},
    createdAt: {type: Date, required: true},
    updatedAt: {type: Date, required: true},
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Compound index for efficient lookups
ApplicantsSchema.index({ walletAddress: 1, privyId: 1 });

export const Applicants = mongoose.model<IApplicants>('Applicants', ApplicantsSchema);
