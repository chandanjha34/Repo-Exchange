import { useState, useCallback } from 'react';
import { useMovementWallet } from './useMovementWallet';
import { useUser } from '@/contexts/UserContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Payment state machine states
 * idle → initiating → signing → broadcasting → confirming → success/error
 */
export type PaymentState =
  | { status: 'idle' }
  | { status: 'initiating' }
  | { status: 'signing'; amount: number; recipientAddress: string }
  | { status: 'broadcasting'; txHash: string }
  | { status: 'confirming'; txHash: string }
  | { status: 'granting_access'; txHash: string }
  | { status: 'success'; txHash: string }
  | { status: 'error'; error: string };

/**
 * Backend error response format
 */
interface BackendErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  actionableSteps?: string[];
}

/**
 * Payment initiation response from backend
 */
interface PaymentResponse {
  paymentId: string;
  amount: number;
  recipientAddress: string;
  expiresAt: number;
  projectId: string;
  accessType: 'demo' | 'download';
}

/**
 * Access response from backend
 */
interface AccessResponse {
  success: boolean;
  accessGranted: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Hook return type
 */
export interface UsePaymentReturn {
  // Initiate payment for a repository
  initiatePayment: (projectId: string, accessType: 'demo' | 'download') => Promise<void>;

  // Current payment state
  paymentState: PaymentState;

  // Error if payment fails
  error: string | null;

  // Reset payment state
  reset: () => void;

  // Loading flag for convenience
  isLoading: boolean;
}

/**
 * Custom hook for handling payment flow with Movement blockchain
 * 
 * Flow:
 * 1. Initiate payment (get payment details from backend)
 * 2. Sign transaction (Movement wallet prompts user)
 * 3. Broadcast transaction (Movement wallet sends to blockchain)
 * 4. Confirm transaction (poll for confirmation)
 * 5. Grant access (backend verifies and grants access)
 * 
 * Requirements: 9.3, 10.3, 11.1
 */
export function usePayment(): UsePaymentReturn {
  const { userId } = useUser(); // Get userId from UserContext
  const { address, connected, sendTransaction } = useMovementWallet(); // For transactions

  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' });
  const [error, setError] = useState<string | null>(null);

  // Get user's Movement wallet address
  const userAddress = address;

  /**
   * Reset payment state to idle
   */
  const reset = useCallback(() => {
    setPaymentState({ status: 'idle' });
    setError(null);
  }, []);

  /**
   * Poll for transaction confirmation
   * Requirements: 11.3, 11.4
   */
  const pollTransactionConfirmation = useCallback(
    async (txHash: string, paymentId: string): Promise<void> => {
      const maxAttempts = 60; // Poll for up to 60 seconds
      const pollInterval = 1000; // Poll every 1 second
      let attempts = 0;

      const poll = async (): Promise<void> => {
        attempts++;

        try {
          // Call backend to verify and grant access
          const response = await fetch(`${API_BASE}/api/payments/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId,
              txHash,
              userId, // Use userId instead of userAddress
            }),
          });

          const data = await response.json();

          if (response.status === 202) {
            // Transaction still pending
            if (attempts < maxAttempts) {
              setTimeout(poll, pollInterval);
            } else {
              setPaymentState({
                status: 'error',
                error: 'Transaction confirmation timeout. Please check your transaction status.',
              });
              setError('Transaction confirmation timeout');
            }
            return;
          }

          if (!response.ok || !data.success) {
            const errorData = data as BackendErrorResponse;
            const errorMessage = errorData.errorCode
              ? `${errorData.errorCode}: ${errorData.error}`
              : errorData.error;

            setPaymentState({
              status: 'error',
              error: errorMessage,
            });
            setError(errorMessage);
            return;
          }

          // Success! Access granted
          const accessData = data.data as AccessResponse;
          setPaymentState({
            status: 'success',
            txHash: accessData.txHash || txHash,
          });
          setError(null);
        } catch (err) {
          console.error('[usePayment] Verification polling error:', err);

          if (attempts < maxAttempts) {
            // Retry on network errors
            setTimeout(poll, pollInterval);
          } else {
            setPaymentState({
              status: 'error',
              error: 'Failed to verify payment. Please contact support.',
            });
            setError('Failed to verify payment');
          }
        }
      };

      // Start polling
      await poll();
    },
    [userId]
  );

  /**
   * Initiate payment for repository access
   * Requirements: 9.3, 10.3, 11.1
   */
  const initiatePayment = useCallback(
    async (projectId: string, accessType: 'demo' | 'download'): Promise<void> => {
      console.log('[usePayment] ========== PAYMENT INITIATED ==========');
      console.log('[usePayment] Project ID:', projectId);
      console.log('[usePayment] Access Type:', accessType);
      console.log('[usePayment] User ID:', userId);
      console.log('[usePayment] User Address:', userAddress);
      console.log('[usePayment] Wallet Connected:', connected);

      // Validate user is logged in
      if (!userId) {
        console.error('[usePayment] ERROR: User not logged in');
        setPaymentState({
          status: 'error',
          error: 'Please log in to make a purchase',
        });
        setError('User not logged in');
        return;
      }

      // Validate wallet is connected
      if (!userAddress || !connected) {
        console.error('[usePayment] ERROR: Wallet not connected');
        console.log('[usePayment] Wallet details:', { userAddress, connected });
        setPaymentState({
          status: 'error',
          error: 'Please connect your Movement wallet first',
        });
        setError('Wallet not connected');
        return;
      }

      try {
        // Step 1: Initiate payment (get payment details)
        console.log('[usePayment] Step 1: Initiating payment...');
        setPaymentState({ status: 'initiating' });
        setError(null);

        const requestBody = {
          userId,
          projectId,
          accessType,
        };
        console.log('[usePayment] API Request Body:', requestBody);

        const initiateResponse = await fetch(`${API_BASE}/api/payments/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('[usePayment] Initiate Response Status:', initiateResponse.status);

        const initiateData = await initiateResponse.json();
        console.log('[usePayment] Initiate Response Data:', initiateData);

        if (!initiateResponse.ok || !initiateData.success) {
          const errorData = initiateData as BackendErrorResponse;
          const errorMessage = errorData.errorCode
            ? `${errorData.errorCode}: ${errorData.error}`
            : errorData.error || 'Failed to initiate payment';

          console.error('[usePayment] Payment initiation failed:', errorMessage);
          console.error('[usePayment] Error details:', errorData);

          setPaymentState({
            status: 'error',
            error: errorMessage,
          });
          setError(errorMessage);
          return;
        }

        const paymentDetails = initiateData.data as PaymentResponse;
        console.log('[usePayment] Payment Details Received:', {
          paymentId: paymentDetails.paymentId,
          amount: paymentDetails.amount,
          recipientAddress: paymentDetails.recipientAddress,
        });

        // Step 2: Sign and broadcast transaction with Movement wallet
        // Requirements: 9.3, 10.3
        console.log('[usePayment] Step 2: Requesting wallet signature...');
        setPaymentState({
          status: 'signing',
          amount: paymentDetails.amount,
          recipientAddress: paymentDetails.recipientAddress,
        });

        // Amount is already in MOVE, no conversion needed
        const amountInMove = paymentDetails.amount;
        console.log('[usePayment] Amount in MOVE:', amountInMove);
        console.log('[usePayment] Recipient:', paymentDetails.recipientAddress);

        // Use Movement wallet to send transaction
        console.log('[usePayment] Calling sendTransaction...');
        const txResult = await sendTransaction(
          paymentDetails.recipientAddress,
          amountInMove
        );

        console.log('[usePayment] Transaction Result:', txResult);

        if (!txResult.success) {
          console.error('[usePayment] Transaction failed:', txResult.error);
          setPaymentState({
            status: 'error',
            error: txResult.error || 'Transaction failed',
          });
          setError(txResult.error || 'Transaction failed');
          return;
        }

        const hash = txResult.txHash!;
        console.log('[usePayment] Transaction Hash:', hash);

        // Step 3: Transaction broadcasted
        // Requirements: 11.1
        console.log('[usePayment] Step 3: Broadcasting transaction...');
        setPaymentState({
          status: 'broadcasting',
          txHash: hash,
        });

        // Step 4: Wait a moment then start confirming
        setTimeout(() => {
          setPaymentState({
            status: 'confirming',
            txHash: hash,
          });
        }, 1000);

        // Step 5: Poll for confirmation and access grant
        // Requirements: 11.3, 11.4
        console.log('[usePayment] Step 5: Polling for confirmation...');
        setTimeout(() => {
          setPaymentState({
            status: 'granting_access',
            txHash: hash,
          });
        }, 2000);

        await pollTransactionConfirmation(hash, paymentDetails.paymentId);
        console.log('[usePayment] ========== PAYMENT COMPLETED ==========');
      } catch (err) {
        console.error('[usePayment] Payment error:', err);

        // Handle specific error types
        let errorMessage = 'Payment failed';

        if (err instanceof Error) {
          if (err.message.includes('rejected') || err.message.includes('denied')) {
            errorMessage = 'Transaction rejected by user';
          } else if (err.message.includes('insufficient')) {
            errorMessage = 'Insufficient MOVE balance';
          } else if (err.message.includes('network')) {
            errorMessage = 'Network error. Please check your connection.';
          } else {
            errorMessage = err.message;
          }
        }

        setPaymentState({
          status: 'error',
          error: errorMessage,
        });
        setError(errorMessage);
      }
    },
    [userId, userAddress, connected, sendTransaction, pollTransactionConfirmation]
  );

  // Compute loading flag for convenience
  const isLoading =
    paymentState.status === 'initiating' ||
    paymentState.status === 'signing' ||
    paymentState.status === 'broadcasting' ||
    paymentState.status === 'confirming' ||
    paymentState.status === 'granting_access';

  return {
    initiatePayment,
    paymentState,
    error,
    reset,
    isLoading,
  };
}

export default usePayment;
