/**
 * Wallet API Service
 * Fetches data from blockchain based on configuration
 * Currently supports Ethereum-compatible chains (Privy embedded wallets)
 */

// Network configuration - using public RPC endpoints
const NETWORKS = {
  ethereum: {
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    symbol: 'ETH',
    decimals: 18,
    chainId: 1,
  },
  sepolia: {
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    symbol: 'ETH',
    decimals: 18,
    chainId: 11155111,
  },
  base: {
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    symbol: 'ETH',
    decimals: 18,
    chainId: 8453,
  },
  'base-sepolia': {
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    symbol: 'ETH',
    decimals: 18,
    chainId: 84532,
  },
};

// Use environment variable or default to sepolia testnet
const NETWORK = (import.meta.env.VITE_NETWORK as keyof typeof NETWORKS) || 'sepolia';
const config = NETWORKS[NETWORK] || NETWORKS.sepolia;

export interface WalletBalance {
  balance: string;
  balanceUsd: string;
  symbol: string;
  rawBalance: string;
}

export interface Transaction {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  from?: string;
  to?: string;
}

/**
 * Format balance from wei to ETH/token
 */
function formatBalance(wei: string, decimals: number = 18): string {
  try {
    const balance = BigInt(wei);
    const divisor = BigInt(10 ** decimals);
    const integerPart = balance / divisor;
    const fractionalPart = balance % divisor;
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 4);
    return `${integerPart}.${fractionalStr}`;
  } catch {
    return '0.0000';
  }
}

/**
 * Fetch ETH price from CoinGecko (free API)
 */
async function fetchEthPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return 0;
    const data = await response.json();
    return data.ethereum?.usd || 0;
  } catch {
    return 0; // Return 0 if price fetch fails
  }
}

/**
 * Fetch wallet balance using JSON-RPC
 */
export async function fetchWalletBalance(address: string): Promise<WalletBalance> {
  try {
    // Validate address format
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      throw new Error('Invalid wallet address');
    }

    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'RPC error');
    }

    const rawBalance = data.result || '0x0';
    const balanceWei = BigInt(rawBalance).toString();
    const balance = formatBalance(balanceWei, config.decimals);
    
    // Fetch current ETH price
    const ethPrice = await fetchEthPrice();
    const balanceUsd = ethPrice > 0 
      ? (parseFloat(balance) * ethPrice).toFixed(2)
      : '0.00';

    return {
      balance,
      balanceUsd,
      symbol: config.symbol,
      rawBalance: balanceWei,
    };
  } catch (error) {
    console.error('Error fetching balance:', error);
    return {
      balance: '0.0000',
      balanceUsd: '0.00',
      symbol: config.symbol,
      rawBalance: '0',
    };
  }
}

/**
 * Fetch transaction history
 * Note: For production, use Etherscan API or similar indexer
 */
export async function fetchTransactions(_address: string): Promise<Transaction[]> {
  // Transaction history requires an indexer like Etherscan
  // For now, return empty array - in production, integrate with Etherscan API
  // or your backend that indexes transactions
  
  // Example using Etherscan API (requires API key in production):
  // const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
  // if (apiKey) {
  //   const response = await fetch(
  //     `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${_address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
  //   );
  //   const data = await response.json();
  //   if (data.status === '1' && data.result) {
  //     return data.result.slice(0, 10).map(tx => ({
  //       hash: tx.hash,
  //       type: tx.from.toLowerCase() === _address.toLowerCase() ? 'send' : 'receive',
  //       amount: formatBalance(tx.value, 18) + ' ETH',
  //       status: tx.txreceipt_status === '1' ? 'success' : 'failed',
  //       timestamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString(),
  //       from: tx.from,
  //       to: tx.to,
  //     }));
  //   }
  // }
  
  return [];
}

/**
 * Prepare transaction data
 * Returns the value in wei for the transaction
 */
export async function prepareTransaction(
  _fromAddress: string,
  _toAddress: string,
  amount: string
): Promise<{ payload: string; gasEstimate: string; valueWei: string }> {
  // Convert amount to wei
  const amountFloat = parseFloat(amount);
  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw new Error('Invalid amount');
  }
  const valueWei = BigInt(Math.floor(amountFloat * Math.pow(10, config.decimals))).toString();
  
  return {
    payload: '0x', // Empty data for simple transfer
    gasEstimate: '21000', // Standard gas for ETH transfer
    valueWei,
  };
}

/**
 * Confirm transaction on chain
 */
export async function confirmTransaction(
  txHash: string,
  _fromAddress: string,
  _toAddress: string,
  _amount: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check transaction receipt
    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    
    if (data.result) {
      const success = data.result.status === '0x1';
      return {
        success,
        message: success ? 'Transaction confirmed' : 'Transaction failed',
      };
    }

    return {
      success: true,
      message: 'Transaction pending',
    };
  } catch {
    return {
      success: true,
      message: 'Transaction submitted',
    };
  }
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
  return `${config.explorerUrl}/tx/${txHash}`;
}

/**
 * Get current network config
 */
export function getNetworkConfig() {
  return {
    ...config,
    network: NETWORK,
  };
}
