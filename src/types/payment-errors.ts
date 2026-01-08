/**
 * Frontend Payment Error Types
 * Mirrors backend error codes for consistent error handling
 */

export enum PaymentErrorCode {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  TX_REJECTED = 'TX_REJECTED',
  TX_FAILED = 'TX_FAILED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  ACCESS_GRANT_FAILED = 'ACCESS_GRANT_FAILED',
  ALREADY_HAS_ACCESS = 'ALREADY_HAS_ACCESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface PaymentErrorInfo {
  code: PaymentErrorCode;
  userMessage: string;
  actionableSteps: string[];
  recoverable: boolean;
}

export const PAYMENT_ERROR_INFO: Record<PaymentErrorCode, Omit<PaymentErrorInfo, 'code'>> = {
  [PaymentErrorCode.INSUFFICIENT_BALANCE]: {
    userMessage: 'Insufficient MOVE balance',
    actionableSteps: [
      'Add MOVE tokens to your wallet',
      'Check your wallet balance',
      'Try a different wallet',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.WALLET_DISCONNECTED]: {
    userMessage: 'Wallet connection error',
    actionableSteps: [
      'Reconnect your wallet',
      'Refresh the page',
      'Check your internet connection',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.TX_REJECTED]: {
    userMessage: 'Transaction rejected',
    actionableSteps: [
      'Try again and approve the transaction',
      'Check transaction details before approving',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.TX_FAILED]: {
    userMessage: 'Transaction failed',
    actionableSteps: [
      'Check network status',
      'Ensure sufficient gas fees',
      'Try again in a few moments',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.VERIFICATION_FAILED]: {
    userMessage: 'Payment verification failed',
    actionableSteps: [
      'Contact support with your transaction hash',
      'Do not retry payment',
    ],
    recoverable: false,
  },
  [PaymentErrorCode.ACCESS_GRANT_FAILED]: {
    userMessage: 'Access grant failed',
    actionableSteps: [
      'Try again in a few moments',
      'Contact support if issue persists',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.ALREADY_HAS_ACCESS]: {
    userMessage: 'You already have access',
    actionableSteps: [
      'Refresh the page to view content',
      'No additional payment needed',
    ],
    recoverable: false,
  },
  [PaymentErrorCode.INVALID_AMOUNT]: {
    userMessage: 'Invalid payment amount',
    actionableSteps: [
      'Ensure payment amount matches required price',
      'Try again',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.NETWORK_ERROR]: {
    userMessage: 'Network error',
    actionableSteps: [
      'Check your internet connection',
      'Try again in a few moments',
      'Check Movement network status',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.CONTRACT_ERROR]: {
    userMessage: 'Contract error',
    actionableSteps: [
      'Try again in a few moments',
      'Contact support if issue persists',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.UNKNOWN_ERROR]: {
    userMessage: 'Something went wrong',
    actionableSteps: [
      'Try again',
      'Contact support if issue persists',
    ],
    recoverable: true,
  },
};

/**
 * Parse error message and extract error code
 */
export function parsePaymentError(error: string | null): PaymentErrorInfo {
  if (!error) {
    return {
      code: PaymentErrorCode.UNKNOWN_ERROR,
      ...PAYMENT_ERROR_INFO[PaymentErrorCode.UNKNOWN_ERROR],
    };
  }

  const errorLower = error.toLowerCase();

  // Try to extract error code from message
  for (const [code, info] of Object.entries(PAYMENT_ERROR_INFO)) {
    if (errorLower.includes(code.toLowerCase().replace(/_/g, ' '))) {
      return {
        code: code as PaymentErrorCode,
        ...info,
      };
    }
  }

  // Pattern matching for common error types
  if (errorLower.includes('insufficient') || errorLower.includes('balance')) {
    return {
      code: PaymentErrorCode.INSUFFICIENT_BALANCE,
      ...PAYMENT_ERROR_INFO[PaymentErrorCode.INSUFFICIENT_BALANCE],
    };
  }

  if (errorLower.includes('rejected') || errorLower.includes('denied')) {
    return {
      code: PaymentErrorCode.TX_REJECTED,
      ...PAYMENT_ERROR_INFO[PaymentErrorCode.TX_REJECTED],
    };
  }

  if (errorLower.includes('already') && errorLower.includes('access')) {
    return {
      code: PaymentErrorCode.ALREADY_HAS_ACCESS,
      ...PAYMENT_ERROR_INFO[PaymentErrorCode.ALREADY_HAS_ACCESS],
    };
  }

  if (errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('connection')) {
    return {
      code: PaymentErrorCode.NETWORK_ERROR,
      ...PAYMENT_ERROR_INFO[PaymentErrorCode.NETWORK_ERROR],
    };
  }

  if (errorLower.includes('contract') || errorLower.includes('revert')) {
    return {
      code: PaymentErrorCode.CONTRACT_ERROR,
      ...PAYMENT_ERROR_INFO[PaymentErrorCode.CONTRACT_ERROR],
    };
  }

  if (errorLower.includes('verification')) {
    return {
      code: PaymentErrorCode.VERIFICATION_FAILED,
      ...PAYMENT_ERROR_INFO[PaymentErrorCode.VERIFICATION_FAILED],
    };
  }

  if (errorLower.includes('grant')) {
    return {
      code: PaymentErrorCode.ACCESS_GRANT_FAILED,
      ...PAYMENT_ERROR_INFO[PaymentErrorCode.ACCESS_GRANT_FAILED],
    };
  }

  // Default to unknown error
  return {
    code: PaymentErrorCode.UNKNOWN_ERROR,
    ...PAYMENT_ERROR_INFO[PaymentErrorCode.UNKNOWN_ERROR],
  };
}
