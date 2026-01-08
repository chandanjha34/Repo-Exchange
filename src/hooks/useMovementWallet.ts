import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useCallback } from 'react';

/**
 * Hook for Movement wallet operations
 * Wraps Aptos wallet adapter for Movement-specific functionality
 */
export function useMovementWallet() {
  const {
    account,
    connected,
    wallet,
    wallets,
    connect,
    disconnect,
    signAndSubmitTransaction,
    signMessage,
    network,
  } = useWallet();

  // Get Movement wallet address - handle various formats
  // Aptos addresses can be strings or objects with toString()
  let address: string | null = null;
  if (account?.address) {
    if (typeof account.address === 'string') {
      address = account.address;
    } else if (typeof account.address === 'object' && 'toString' in account.address) {
      address = account.address.toString();
    } else {
      address = String(account.address);
    }
  }

  // Connect to a specific wallet
  const connectWallet = useCallback(async (walletName: string) => {
    try {
      await connect(walletName);
      return { success: true };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }, [connect]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      return { success: true };
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Disconnection failed',
      };
    }
  }, [disconnect]);

  // Send MOVE tokens
  const sendTransaction = useCallback(async (
    recipientAddress: string,
    amount: number // in MOVE (not smallest units)
  ) => {
    if (!connected || !address) {
      return {
        success: false,
        error: 'Wallet not connected',
      };
    }

    try {
      // Convert MOVE to smallest units (8 decimals)
      const amountInSmallestUnits = Math.floor(amount * 1e8);

      // Sign and submit transaction
      const response = await signAndSubmitTransaction({
        data: {
          function: '0x1::aptos_account::transfer',
          typeArguments: [],
          functionArguments: [recipientAddress, amountInSmallestUnits],
        },
      });

      return {
        success: true,
        txHash: response.hash,
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      };
    }
  }, [connected, address, signAndSubmitTransaction]);

  return {
    // Wallet info
    account,
    address,
    connected,
    wallet,
    wallets,
    network,
    
    // Actions
    connect: connectWallet,
    disconnect: disconnectWallet,
    sendTransaction,
    signMessage,
    signAndSubmitTransaction,
  };
}

export default useMovementWallet;
