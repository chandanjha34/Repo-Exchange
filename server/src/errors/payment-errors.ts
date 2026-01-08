/**
 * Payment Error Types and Messages
 * Defines error codes and user-friendly messages for payment flow
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

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  userMessage: string;
  actionableSteps: string[];
  recoverable: boolean;
}

export const PAYMENT_ERRORS: Record<PaymentErrorCode, Omit<PaymentError, 'code'>> = {
  [PaymentErrorCode.INSUFFICIENT_BALANCE]: {
    message: 'User has insufficient MOVE balance',
    userMessage: 'Insufficient MOVE balance',
    actionableSteps: [
      'Add MOVE tokens to your wallet',
      'Check your wallet balance',
      'Try a different wallet',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.WALLET_DISCONNECTED]: {
    message: 'Privy wallet not connected',
    userMessage: 'Wallet connection error',
    actionableSteps: [
      'Reconnect your wallet',
      'Refresh the page',
      'Check your internet connection',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.TX_REJECTED]: {
    message: 'User rejected the transaction',
    userMessage: 'Transaction rejected',
    actionableSteps: [
      'Try again and approve the transaction',
      'Check transaction details before approving',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.TX_FAILED]: {
    message: 'Blockchain transaction failed',
    userMessage: 'Transaction failed',
    actionableSteps: [
      'Check network status',
      'Ensure sufficient gas fees',
      'Try again in a few moments',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.VERIFICATION_FAILED]: {
    message: 'Payment verification failed',
    userMessage: 'Payment verification failed',
    actionableSteps: [
      'Contact support with your transaction hash',
      'Do not retry payment',
    ],
    recoverable: false,
  },
  [PaymentErrorCode.ACCESS_GRANT_FAILED]: {
    message: 'Access grant contract call failed',
    userMessage: 'Access grant failed',
    actionableSteps: [
      'Try again in a few moments',
      'Contact support if issue persists',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.ALREADY_HAS_ACCESS]: {
    message: 'User already has access to this repository',
    userMessage: 'You already have access',
    actionableSteps: [
      'Refresh the page to view content',
      'No additional payment needed',
    ],
    recoverable: false,
  },
  [PaymentErrorCode.INVALID_AMOUNT]: {
    message: 'Payment amount is invalid or insufficient',
    userMessage: 'Invalid payment amount',
    actionableSteps: [
      'Ensure payment amount matches required price',
      'Try again',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.NETWORK_ERROR]: {
    message: 'Network connection error',
    userMessage: 'Network error',
    actionableSteps: [
      'Check your internet connection',
      'Try again in a few moments',
      'Check Movement network status',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.CONTRACT_ERROR]: {
    message: 'Smart contract error',
    userMessage: 'Contract error',
    actionableSteps: [
      'Try again in a few moments',
      'Contact support if issue persists',
    ],
    recoverable: true,
  },
  [PaymentErrorCode.UNKNOWN_ERROR]: {
    message: 'An unknown error occurred',
    userMessage: 'Something went wrong',
    actionableSteps: [
      'Try again',
      'Contact support if issue persists',
    ],
    recoverable: true,
  },
};

/**
 * Create a PaymentError from an error code
 */
export function createPaymentError(code: PaymentErrorCode, details?: string): PaymentError {
  const errorTemplate = PAYMENT_ERRORS[code];
  return {
    code,
    ...errorTemplate,
    message: details ? `${errorTemplate.message}: ${details}` : errorTemplate.message,
  };
}

/**
 * Map blockchain/network errors to payment error codes
 */
export function mapErrorToPaymentError(error: any): PaymentError {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || '';

  // Check for specific error patterns
  if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
    return createPaymentError(PaymentErrorCode.INSUFFICIENT_BALANCE, error.message);
  }

  if (errorMessage.includes('rejected') || errorMessage.includes('denied') || errorCode === 4001) {
    return createPaymentError(PaymentErrorCode.TX_REJECTED, error.message);
  }

  if (errorMessage.includes('already') && errorMessage.includes('access')) {
    return createPaymentError(PaymentErrorCode.ALREADY_HAS_ACCESS, error.message);
  }

  if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('connection')) {
    return createPaymentError(PaymentErrorCode.NETWORK_ERROR, error.message);
  }

  if (errorMessage.includes('contract') || errorMessage.includes('revert')) {
    return createPaymentError(PaymentErrorCode.CONTRACT_ERROR, error.message);
  }

  if (errorMessage.includes('amount') || errorMessage.includes('price')) {
    return createPaymentError(PaymentErrorCode.INVALID_AMOUNT, error.message);
  }

  // Default to unknown error
  return createPaymentError(PaymentErrorCode.UNKNOWN_ERROR, error.message);
}

/**
 * Custom error class for payment errors
 */
export class PaymentErrorException extends Error {
  public readonly paymentError: PaymentError;

  constructor(paymentError: PaymentError) {
    super(paymentError.message);
    this.name = 'PaymentErrorException';
    this.paymentError = paymentError;
  }
}
