import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { 
  fetchWalletBalance, 
  fetchTransactions, 
  WalletBalance,
  Transaction 
} from '@/lib/wallet-api';

export interface UseWalletReturn {
  // Wallet info
  address: string | null;
  balance: WalletBalance | null;
  transactions: Transaction[];
  
  // Loading states
  isLoadingBalance: boolean;
  isLoadingTransactions: boolean;
  isSending: boolean;
  
  // Error states
  balanceError: string | null;
  transactionsError: string | null;
  sendError: string | null;
  
  // Actions
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  sendTransaction: (toAddress: string, amount: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

export function useWallet(): UseWalletReturn {
  const { user } = usePrivy();
  const { ready: walletsReady } = useWallets();
  const { sendTransaction: privySendTransaction } = useSendTransaction();
  
  // Get embedded wallet address from user object
  const address = user?.wallet?.address ?? null;
  
  // State
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Fetch balance using direct RPC call
  const refreshBalance = useCallback(async () => {
    if (!address) return;
    
    setIsLoadingBalance(true);
    setBalanceError(null);
    
    try {
      const data = await fetchWalletBalance(address);
      setBalance(data);
    } catch (error) {
      setBalanceError(error instanceof Error ? error.message : 'Failed to fetch balance');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [address]);

  // Fetch transactions
  const refreshTransactions = useCallback(async () => {
    if (!address) return;
    
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    
    try {
      const data = await fetchTransactions(address);
      setTransactions(data);
    } catch (error) {
      setTransactionsError(error instanceof Error ? error.message : 'Failed to fetch transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [address]);

  // Send transaction using Privy's useSendTransaction hook
  const sendTransaction = useCallback(async (
    toAddress: string, 
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletsReady) {
      return { success: false, error: 'Wallets not ready' };
    }

    // Validate recipient address
    if (!toAddress || !toAddress.startsWith('0x') || toAddress.length !== 42) {
      return { success: false, error: 'Invalid recipient address' };
    }

    // Validate amount
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    setIsSending(true);
    setSendError(null);

    try {
      // Convert amount to wei (hex string)
      const valueWei = BigInt(Math.floor(amountFloat * 1e18));
      const valueHex = `0x${valueWei.toString(16)}`;

      // Use Privy's sendTransaction hook - this handles signing and UI
      const { hash } = await privySendTransaction(
        {
          to: toAddress as `0x${string}`,
          value: valueHex as `0x${string}`,
        },
        {
          address: address as `0x${string}`,
        }
      );

      // Refresh balance after successful transaction
      setTimeout(() => {
        refreshBalance();
        refreshTransactions();
      }, 2000);

      return { success: true, txHash: hash };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setSendError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  }, [address, walletsReady, privySendTransaction, refreshBalance, refreshTransactions]);

  // Auto-fetch on mount and address change
  useEffect(() => {
    if (address) {
      refreshBalance();
      refreshTransactions();
    }
  }, [address, refreshBalance, refreshTransactions]);

  return {
    address,
    balance,
    transactions,
    isLoadingBalance,
    isLoadingTransactions,
    isSending,
    balanceError,
    transactionsError,
    sendError,
    refreshBalance,
    refreshTransactions,
    sendTransaction,
  };
}

export default useWallet;
