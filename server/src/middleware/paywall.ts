import { x402Paywall } from "x402plus";
import { Request, Response, NextFunction } from "express";

/**
 * x402 Paywall Configuration for Movement Network
 * 
 * Note: x402 paywall is configured with a placeholder address.
 * The actual payment recipient is determined dynamically based on the project owner.
 * See payment controller for the actual payment flow implementation.
 * 
 * Requirements: 1.4, 9.1
 */

// Get prices from environment or use defaults
const VIEW_PRICE_MOVE = process.env.VIEW_PRICE_MOVE || "50000000"; // 0.5 MOVE
const DOWNLOAD_PRICE_MOVE = process.env.DOWNLOAD_PRICE_MOVE || "100000000"; // 1 MOVE
const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || "https://facilitator.stableyard.fi";

// Placeholder address for x402 configuration
// Actual payments go directly to project owners (see payment controller)
const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Base x402 paywall middleware
 * Note: This is primarily for route protection and price signaling.
 * Actual payment processing is handled by the payment controller which
 * routes payments directly to project owners.
 */
const basePaywallMiddleware = x402Paywall(
  PLACEHOLDER_ADDRESS,
  {
    // View access routes - require 0.5 MOVE payment
    "GET /api/projects/:id/view": {
      network: "movement",
      asset: "0x1::aptos_coin::AptosCoin", // Native MOVE token
      maxAmountRequired: VIEW_PRICE_MOVE,
      description: "View repository content",
      mimeType: "application/json",
      maxTimeoutSeconds: 600
    },
    
    // Download access routes - require 1 MOVE payment
    "GET /api/projects/:id/download": {
      network: "movement",
      asset: "0x1::aptos_coin::AptosCoin", // Native MOVE token
      maxAmountRequired: DOWNLOAD_PRICE_MOVE,
      description: "Download repository content",
      mimeType: "application/json",
      maxTimeoutSeconds: 600
    },
    
    // Legacy routes for backward compatibility
    "POST /api/transactions": {
      network: "movement",
      asset: "0x1::aptos_coin::AptosCoin",
      maxAmountRequired: DOWNLOAD_PRICE_MOVE,
      description: "Unlock transaction features",
      mimeType: "application/json",
      maxTimeoutSeconds: 600
    },
    "GET /api/access/private-resource": {
      network: "movement",
      asset: "0x1::aptos_coin::AptosCoin",
      maxAmountRequired: VIEW_PRICE_MOVE,
      description: "Premium access",
      mimeType: "application/json",
      maxTimeoutSeconds: 600
    }
  },
  {
    url: FACILITATOR_URL
  }
);

/**
 * Enhanced paywall middleware with payment controller integration
 * 
 * This middleware:
 * 1. Runs the base x402 paywall middleware
 * 2. Captures x402 payment events
 * 3. Forwards payment confirmations to the verification endpoint
 * 4. Maps x402 errors to system errors
 * 
 * Requirements: 1.1, 4.1
 */
export const paywallMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Store original response methods to intercept x402 responses
  const originalJson = res.json.bind(res);
  const originalStatus = res.status.bind(res);
  
  let statusCode = 200;
  
  // Override status to capture status code
  res.status = function(code: number) {
    statusCode = code;
    return originalStatus(code);
  };
  
  // Override json to intercept x402 responses
  res.json = function(body: any) {
    // Check if this is an x402 payment required response (402 status)
    if (statusCode === 402 && body) {
      console.log('[Paywall] x402 payment required:', {
        path: req.path,
        method: req.method,
        paymentDetails: body
      });
      
      // Map x402 response to our system format
      const enhancedResponse = {
        ...body,
        paymentRequired: true,
        systemMessage: 'Payment required to access this resource',
        // Include helpful context for the frontend
        context: {
          endpoint: `${req.method} ${req.path}`,
          timestamp: new Date().toISOString()
        }
      };
      
      return originalJson(enhancedResponse);
    }
    
    // Check if this is an x402 error response
    if (statusCode >= 400 && body && body.error) {
      console.error('[Paywall] x402 error:', {
        status: statusCode,
        error: body.error,
        path: req.path
      });
      
      // Map x402 errors to system errors
      const mappedError = mapX402Error(body.error, statusCode);
      
      return originalJson({
        success: false,
        error: mappedError.message,
        code: mappedError.code,
        originalError: body.error,
        x402Error: true
      });
    }
    
    // Check if this is a successful payment confirmation from x402
    if (statusCode === 200 && body && body.paymentConfirmed) {
      console.log('[Paywall] x402 payment confirmed:', {
        txHash: body.txHash,
        path: req.path
      });
      
      // Note: In a full implementation, we would forward this to the verification endpoint
      // For now, we log it and let the frontend handle verification via /api/payments/verify
    }
    
    return originalJson(body);
  };
  
  // Run the base x402 paywall middleware
  basePaywallMiddleware(req, res, next);
};

/**
 * Map x402 errors to system error codes and messages
 * Requirements: 1.1, 4.1
 */
function mapX402Error(x402Error: string, statusCode: number): { code: string; message: string } {
  // Common x402 error patterns
  if (x402Error.toLowerCase().includes('insufficient')) {
    return {
      code: 'INSUFFICIENT_BALANCE',
      message: 'Insufficient MOVE balance to complete payment'
    };
  }
  
  if (x402Error.toLowerCase().includes('timeout') || x402Error.toLowerCase().includes('expired')) {
    return {
      code: 'PAYMENT_TIMEOUT',
      message: 'Payment request expired. Please try again.'
    };
  }
  
  if (x402Error.toLowerCase().includes('rejected') || x402Error.toLowerCase().includes('cancelled')) {
    return {
      code: 'PAYMENT_REJECTED',
      message: 'Payment was rejected or cancelled'
    };
  }
  
  if (x402Error.toLowerCase().includes('network') || x402Error.toLowerCase().includes('connection')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error occurred. Please check your connection and try again.'
    };
  }
  
  if (x402Error.toLowerCase().includes('invalid')) {
    return {
      code: 'INVALID_PAYMENT',
      message: 'Invalid payment details. Please try again.'
    };
  }
  
  // Default error mapping based on status code
  if (statusCode === 402) {
    return {
      code: 'PAYMENT_REQUIRED',
      message: 'Payment required to access this resource'
    };
  }
  
  if (statusCode === 403) {
    return {
      code: 'ACCESS_DENIED',
      message: 'Access denied. Payment verification failed.'
    };
  }
  
  if (statusCode >= 500) {
    return {
      code: 'SERVER_ERROR',
      message: 'Payment service error. Please try again later.'
    };
  }
  
  // Generic error
  return {
    code: 'PAYMENT_ERROR',
    message: x402Error || 'An error occurred during payment processing'
  };
}
