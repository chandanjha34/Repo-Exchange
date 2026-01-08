import { Router, Request, Response } from 'express';

import mongoose from 'mongoose';
import { Bounty } from '../models/bounty';
import { Applicants } from '../models/Applicants';

const router = Router();


router.get('/', async (req: Request, res: Response) => {
    try {
        const bounties = await Bounty.find().exec();
        return res.status(200).json({
            success: true,
            data: bounties,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bounties',
        });
    }
})
/**
 * POST /api/transactions
 * Create a new transaction record (for future x402 integration)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      company,
      logo,
      title,
      reward,
      duration,
      difficulty,
      category,
      tags,
      overview,
      objectives,
      expectations,
      deliverables,
      evaluation,
      faq,
      privyId,
      walletAddress,
      email,
      createdAt,
    } = req.body;

    if (!walletAddress || !company || !title || !reward || !duration || !difficulty || !category || !tags || !overview || !objectives || !expectations || !deliverables || !evaluation || !faq || !privyId) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress, company, title, reward, duration, difficulty, category, tags, overview, objectives, expectations, deliverables, evaluation, faq and privyId are required',
      });
    }

    const bounty = await Bounty.create({
      company,
      logo,
      title,
      reward,
      duration,
      difficulty,
      category,
      tags,
      overview,
      objectives,
      expectations,
      deliverables,
      evaluation,
      faq,
      privyId,
      walletAddress: walletAddress.toLowerCase(),
      email,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      data: bounty,
    });
  } catch (error) {
    console.error('bounty Create error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create bounty',
    });
  }
});

router.post('/submit', async(req : Request, res: Response) => {
    // Endpoint to handle bounty submissions
    try {
        const {
            TeamName,
            TeamMembers,
            BountyId,
            walletAddress,
            RepositoryLink,
            LiveDemoURL,
            ProductOverview,
            TechnicalArchitecture,
            HiringDemand,
            github,
            linkedin,
            twitter,
            website,
            other,
            status,
        } = req.body;

        if ( !BountyId || !RepositoryLink || !ProductOverview || !TechnicalArchitecture || !HiringDemand || !walletAddress || !TeamName || !TeamMembers || !github || !linkedin || !twitter || !website || !other || !status ) {
            return res.status(400).json({
                success: false,
                error: 'BountyId, RepositoryLink, ProductOverview, TechnicalArchitecture, HiringDemand, walletAddress, TeamName, TeamMembers, github, linkedin, twitter, website, other and status are required',
            });
        }
    
        const submission = await Applicants.create({
            TeamName,
            TeamMembers,
            BountyId,
            walletAddress: walletAddress.toLowerCase(),
            RepositoryLink,
            LiveDemoURL,
            ProductOverview,
            TechnicalArchitecture,
            HiringDemand,
            github,
            linkedin,
            twitter,
            website,
            other,
            status,
        })

        return res.status(201).json({
            success: true,
            data: submission,
        });

    } catch (error) {
        console.error('Bounty submission error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to submit bounty',
        });
    }
});

router.get('/submissions/:bountyId/:walletAddress', async (req: Request, res: Response) => {
    try {

        const { bountyId, walletAddress } = req.params;
        const submissions = await Applicants.find({ bountyId, walletAddress }).exec();
        return res.status(200).json({
            success: true,
            data: submissions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch submissions',
        });
    }
});

export { router as bountyRouter };