import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

/**
 * Result of a blockchain transaction
 */
export interface TransactionResult {
  success: boolean;
  txHash: string;
  blockNumber?: number;
  error?: string;
}

/**
 * Details of a verified transaction
 */
export interface TransactionDetails {
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
}

/**
 * Service for interacting with Movement blockchain
 */
class MovementService {
  private aptos: Aptos | null = null;
  private adminAccount: Account | null = null;
  private contractAddress: string = '';
  private isConnected: boolean = false;
  private rpcUrl: string = '';
  private chainId: number = 0;

  /**
   * Initialize connection to Movement network
   * @param rpcUrl - RPC endpoint URL
   * @param chainId - Chain ID for the network
   */
  async connect(rpcUrl: string, chainId: number): Promise<void> {
    try {
      this.rpcUrl = rpcUrl;
      this.chainId = chainId;

      // Configure Aptos client for Movement network
      const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: rpcUrl,
      });

      this.aptos = new Aptos(config);

      // Load admin account from environment
      const adminPrivateKey = process.env.MOVEMENT_ADMIN_PRIVATE_KEY;
      if (!adminPrivateKey) {
        throw new Error('MOVEMENT_ADMIN_PRIVATE_KEY not configured');
      }

      // Create admin account from private key
      const privateKey = new Ed25519PrivateKey(adminPrivateKey);
      this.adminAccount = Account.fromPrivateKey({ privateKey });

      // Load contract address
      this.contractAddress = process.env.MOVEMENT_CONTRACT_ADDRESS || '';
      if (!this.contractAddress) {
        throw new Error('MOVEMENT_CONTRACT_ADDRESS not configured');
      }

      // Perform health check
      await this.healthCheck();

      this.isConnected = true;
      console.log(`✓ Connected to Movement network at ${rpcUrl} (Chain ID: ${chainId})`);
    } catch (error) {
      this.isConnected = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`✗ Failed to connect to Movement network: ${errorMessage}`);
      throw new Error(`Movement connection failed: ${errorMessage}`);
    }
  }

  /**
   * Perform health check on the connection
   */
  async healthCheck(): Promise<boolean> {
    if (!this.aptos) {
      throw new Error('Movement service not initialized. Call connect() first.');
    }

    try {
      // Try to get the ledger info to verify connection
      const ledgerInfo = await this.aptos.getLedgerInfo();
      
      // Verify chain ID matches
      if (ledgerInfo.chain_id !== this.chainId) {
        throw new Error(
          `Chain ID mismatch: expected ${this.chainId}, got ${ledgerInfo.chain_id}`
        );
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Health check failed: ${errorMessage}`);
    }
  }

  /**
   * Ensure the service is connected before operations
   */
  private ensureConnected(): void {
    if (!this.isConnected || !this.aptos || !this.adminAccount) {
      throw new Error('Movement service not connected. Call connect() first.');
    }
  }

  /**
   * Get the Aptos client instance
   */
  getClient(): Aptos {
    this.ensureConnected();
    return this.aptos!;
  }

  /**
   * Get the admin account
   */
  getAdminAccount(): Account {
    this.ensureConnected();
    return this.adminAccount!;
  }

  /**
   * Get the contract address
   */
  getContractAddress(): string {
    this.ensureConnected();
    return this.contractAddress;
  }

  /**
   * Check if service is connected
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Grant access to a user for a repository
   * Calls layr::access::grant_access on the contract
   * @param userAddress - User's wallet address
   * @param repoId - Repository ID
   * @param accessType - Access level (1=view, 2=download)
   */
  async grantAccess(
    userAddress: string,
    repoId: number,
    accessType: 1 | 2
  ): Promise<TransactionResult> {
    this.ensureConnected();

    try {
      const transaction = await this.aptos!.transaction.build.simple({
        sender: this.adminAccount!.accountAddress,
        data: {
          function: `${this.contractAddress}::access::grant_access`,
          typeArguments: [],
          functionArguments: [userAddress, repoId, accessType],
        },
      });

      // Sign and submit transaction
      const committedTxn = await this.aptos!.signAndSubmitTransaction({
        signer: this.adminAccount!,
        transaction,
      });

      // Wait for transaction to be confirmed
      const executedTransaction = await this.aptos!.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      return {
        success: executedTransaction.success,
        txHash: committedTxn.hash,
        blockNumber: Number(executedTransaction.version),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to grant access: ${errorMessage}`);
      
      return {
        success: false,
        txHash: '',
        error: errorMessage,
      };
    }
  }

  /**
   * Check if a user has access to a repository
   * Queries layr::access::has_access on the contract
   * @param userAddress - User's wallet address
   * @param repoId - Repository ID
   */
  async hasAccess(userAddress: string, repoId: number): Promise<boolean> {
    this.ensureConnected();

    try {
      const result = await this.aptos!.view({
        payload: {
          function: `${this.contractAddress}::access::has_access`,
          typeArguments: [],
          functionArguments: [userAddress, repoId],
        },
      });

      // Result should be a boolean
      return result[0] as boolean;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to check access: ${errorMessage}`);
      // Return false on error (no access)
      return false;
    }
  }

  /**
   * Get the access type for a user
   * Queries the access level from the contract
   * @param userAddress - User's wallet address
   * @param repoId - Repository ID
   */
  async getAccessType(userAddress: string, repoId: number): Promise<number> {
    this.ensureConnected();

    try {
      const result = await this.aptos!.view({
        payload: {
          function: `${this.contractAddress}::access::get_access_type`,
          typeArguments: [],
          functionArguments: [userAddress, repoId],
        },
      });

      // Result should be a number (0=none, 1=view, 2=download)
      return Number(result[0]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to get access type: ${errorMessage}`);
      // Return 0 on error (no access)
      return 0;
    }
  }

  /**
   * Verify a transaction on-chain
   * Checks transaction status, amount, and recipient
   * @param txHash - Transaction hash to verify
   * @param expectedRecipient - Expected recipient address (optional)
   * @param expectedAmount - Expected amount in smallest units (optional)
   */
  async verifyTransaction(
    txHash: string,
    expectedRecipient?: string,
    expectedAmount?: string
  ): Promise<TransactionDetails> {
    this.ensureConnected();

    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get transaction by hash
        const transaction = await this.aptos!.getTransactionByHash({
          transactionHash: txHash,
        });

        // Check if transaction is pending
        if (transaction.type === 'pending_transaction') {
          // Transaction is still pending
          if (attempt < maxRetries) {
            console.log(`Transaction ${txHash} is pending, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
          
          return {
            from: '',
            to: '',
            amount: '0',
            status: 'pending',
          };
        }

        // Extract transaction details for committed transactions
        const status = transaction.success ? 'confirmed' : 'failed';
        
        // For coin transfer transactions, extract sender and receiver
        let from = '';
        let to = '';
        let amount = '0';

        if ('sender' in transaction) {
          from = transaction.sender;
        }

        // Parse payload for recipient and amount
        if ('payload' in transaction && transaction.payload) {
          const payload = transaction.payload as any;
          
          if (payload.type === 'entry_function_payload') {
            // Extract arguments for coin transfer
            if (payload.function?.includes('coin::transfer') || 
                payload.function?.includes('aptos_account::transfer')) {
              const args = payload.arguments || [];
              if (args.length >= 2) {
                to = args[0];
                amount = args[1];
              }
            }
          }
        }

        // Verify recipient if provided
        if (expectedRecipient && to !== expectedRecipient) {
          console.warn(`Recipient mismatch: expected ${expectedRecipient}, got ${to}`);
        }

        // Verify amount if provided
        if (expectedAmount && amount !== expectedAmount) {
          const actualAmount = BigInt(amount);
          const requiredAmount = BigInt(expectedAmount);
          
          if (actualAmount < requiredAmount) {
            console.warn(
              `Amount insufficient: expected ${expectedAmount}, got ${amount}`
            );
          }
        }

        const blockNumber = 'version' in transaction ? Number(transaction.version) : undefined;

        return {
          from,
          to,
          amount,
          status,
          blockNumber,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // If transaction not found and we have retries left, wait and retry
        if (errorMessage.includes('not found') && attempt < maxRetries) {
          console.log(`Transaction ${txHash} not found, retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        console.error(`Failed to verify transaction: ${errorMessage}`);
        
        return {
          from: '',
          to: '',
          amount: '0',
          status: 'failed',
        };
      }
    }

    // If we exhausted all retries
    return {
      from: '',
      to: '',
      amount: '0',
      status: 'pending',
    };
  }
}

// Export singleton instance
export const movementService = new MovementService();
