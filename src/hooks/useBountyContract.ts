import { AptosClient, AptosAccount, Types } from 'aptos';
import { useState, useCallback } from 'react';

// Movement Network Configuration
const MOVEMENT_TESTNET = 'https://testnet.movementnetwork.xyz/v1';
const MOVEMENT_MAINNET = 'https://mainnet.movementnetwork.xyz/v1';

// Deployed contract address on Movement Testnet
const MODULE_ADDRESS = import.meta.env.VITE_BOUNTY_CONTRACT_ADDRESS || '0xa492a23821f2f8575d42bbaa3cd65fd4a0afb922c57dc56d78b360a18211f884';

// Initialize Aptos client for Movement blockchain
const client = new AptosClient(MOVEMENT_TESTNET);

export interface BountyCampaign {
    id: number;
    title: string;
    description: string;
    totalRewardPool: number;
    distributedAmount: number;
    deadline: number;
    status: number; // 1=Active, 2=Distributed, 3=Cancelled
    numRecipients: number;
}

export function useBountyContract() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Create a new bounty campaign on-chain
     * Locks MOVE tokens immediately when transaction is signed
     */
    const createCampaign = useCallback(
        async (
            signAndSubmitTx: (payload: any) => Promise<any>, // Direct function from wallet adapter
            title: string,
            description: string,
            rewardAmount: number, // Amount in MOVE tokens
            durationSeconds: number
        ) => {
            try {
                setLoading(true);
                setError(null);

                // Convert MOVE to smallest units (8 decimals)
                const rewardInSmallestUnits = Math.floor(rewardAmount * 100000000);

                // Use the new wallet adapter v2 format (matching useMovementWallet.sendTransaction)
                const payload = {
                    data: {
                        function: `${MODULE_ADDRESS}::bounty_campaign::create_campaign` as const,
                        typeArguments: [] as const,
                        functionArguments: [
                            title,
                            description,
                            rewardInSmallestUnits.toString(),
                            durationSeconds.toString(),
                        ],
                    },
                };

                console.log('[BountyContract] Submitting transaction with payload:', payload);

                // Sign and submit transaction - call the function directly
                const result = await signAndSubmitTx(payload);

                // Handle different response formats (some wallets return object, some return string)
                const txnHash = typeof result === 'string' ? result : result?.hash || result?.txHash || result;

                console.log('[BountyContract] Transaction submitted:', txnHash);

                // Wait for transaction confirmation
                if (txnHash) {
                    await client.waitForTransaction(txnHash);
                }

                console.log('[BountyContract] Campaign created successfully:', txnHash);
                return txnHash;
            } catch (err: any) {
                console.error('[BountyContract] Error creating campaign:', err);
                setError(err.message || 'Failed to create campaign');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Distribute rewards to winners
     * Auto-transfers locked MOVE tokens to winner addresses
     */
    const distributeRewards = useCallback(
        async (
            wallet: any,
            recipients: string[], // Array of winner wallet addresses
            amounts: number[] // Array of reward amounts in MOVE tokens
        ) => {
            try {
                setLoading(true);
                setError(null);

                // Convert amounts to smallest units
                const amountsInSmallestUnits = amounts.map((amt) =>
                    Math.floor(amt * 100000000).toString()
                );

                const payload: Types.TransactionPayload = {
                    type: 'entry_function_payload',
                    function: `${MODULE_ADDRESS}::bounty_campaign::distribute_rewards`,
                    arguments: [recipients, amountsInSmallestUnits],
                    type_arguments: [],
                };

                const txnHash = await wallet.signAndSubmitTransaction(payload);
                await client.waitForTransaction(txnHash);

                console.log('Rewards distributed successfully:', txnHash);
                return txnHash;
            } catch (err: any) {
                console.error('Error distributing rewards:', err);
                setError(err.message || 'Failed to distribute rewards');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Cancel campaign and refund remaining funds to creator
     */
    const cancelCampaign = useCallback(async (wallet: any) => {
        try {
            setLoading(true);
            setError(null);

            const payload: Types.TransactionPayload = {
                type: 'entry_function_payload',
                function: `${MODULE_ADDRESS}::bounty_campaign::cancel_campaign`,
                arguments: [],
                type_arguments: [],
            };

            const txnHash = await wallet.signAndSubmitTransaction(payload);
            await client.waitForTransaction(txnHash);

            console.log('Campaign cancelled successfully:', txnHash);
            return txnHash;
        } catch (err: any) {
            console.error('Error cancelling campaign:', err);
            setError(err.message || 'Failed to cancel campaign');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Get campaign information (view function - no gas cost)
     */
    const getCampaignInfo = useCallback(
        async (creatorAddress: string): Promise<BountyCampaign | null> => {
            try {
                const result = await client.view({
                    function: `${MODULE_ADDRESS}::bounty_campaign::get_campaign_info`,
                    arguments: [creatorAddress],
                    type_arguments: [],
                });

                if (!result || result.length === 0) return null;

                // Parse the returned tuple
                return {
                    id: Number(result[0]),
                    title: result[1] as string,
                    description: result[2] as string,
                    totalRewardPool: Number(result[3]) / 100000000, // Convert to MOVE
                    distributedAmount: Number(result[4]) / 100000000,
                    deadline: Number(result[5]),
                    status: Number(result[6]),
                    numRecipients: Number(result[7]),
                };
            } catch (err: any) {
                console.error('Error fetching campaign info:', err);
                return null;
            }
        },
        []
    );

    /**
     * Get remaining locked funds in a campaign (view function - no gas cost)
     */
    const getRemainingFunds = useCallback(
        async (creatorAddress: string): Promise<number> => {
            try {
                const result = await client.view({
                    function: `${MODULE_ADDRESS}::bounty_campaign::get_remaining_funds`,
                    arguments: [creatorAddress],
                    type_arguments: [],
                });

                return Number(result[0]) / 100000000; // Convert to MOVE
            } catch (err: any) {
                console.error('Error fetching remaining funds:', err);
                return 0;
            }
        },
        []
    );

    /**
     * Check if user has claimed from a specific campaign (view function - no gas cost)
     */
    const hasClaimed = useCallback(
        async (recipientAddress: string, campaignId: number): Promise<boolean> => {
            try {
                const result = await client.view({
                    function: `${MODULE_ADDRESS}::bounty_campaign::has_claimed`,
                    arguments: [recipientAddress, campaignId.toString()],
                    type_arguments: [],
                });

                return result[0] as boolean;
            } catch (err: any) {
                console.error('Error checking claim status:', err);
                return false;
            }
        },
        []
    );

    return {
        // State
        loading,
        error,

        // Functions
        createCampaign,
        distributeRewards,
        cancelCampaign,
        getCampaignInfo,
        getRemainingFunds,
        hasClaimed,
    };
}

export default useBountyContract;
