import { Router } from 'express';
import { initiatePayment, verifyAndGrantAccess, checkAccess, getUserPurchases } from '../controllers/payment';

const router = Router();

/**
 * POST /api/payments/initiate
 * Initiate a payment for repository access
 */
router.post('/initiate', initiatePayment);

/**
 * POST /api/payments/verify
 * Verify payment transaction and grant on-chain access
 */
router.post('/verify', verifyAndGrantAccess);

/**
 * GET /api/payments/check-access/:projectId
 * Check if user has access to a project (queries on-chain state)
 */
router.get('/check-access/:projectId', checkAccess);

/**
 * GET /api/payments/purchases/:userId
 * Get all purchases for a user
 */
router.get('/purchases/:userId', getUserPurchases);

export default router;
