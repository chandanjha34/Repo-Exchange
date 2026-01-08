/**
 * Check isPublished status of projects in database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const ProjectSchema = new mongoose.Schema({
  title: String,
  slug: String,
  isPublished: Boolean,
  ownerWalletAddress: String,
  ownerName: String,
  priceView: Number,
  priceDownload: Number,
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);

async function checkPublishedStatus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const projects = await Project.find({}).select('title isPublished ownerWalletAddress');
    
    console.log(`Found ${projects.length} projects:\n`);
    
    projects.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
      console.log(`   isPublished: ${p.isPublished}`);
      console.log(`   Owner: ${p.ownerWalletAddress}`);
      console.log();
    });

    const publishedCount = projects.filter(p => p.isPublished).length;
    console.log(`Published projects: ${publishedCount}/${projects.length}`);
    
    if (publishedCount === 0 && projects.length > 0) {
      console.log('\n⚠️  No projects are published!');
      console.log('This is why the API returns 0 projects.');
      console.log('\nTo fix: Update projects to set isPublished: true');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPublishedStatus();
