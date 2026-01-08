import { useState } from 'react';
import { useMovementWallet } from '@/hooks/useMovementWallet';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectionProps {
  onWalletConnected?: (address: string) => void;
  onWalletDisconnected?: () => void;
}

/**
 * WalletConnection component provides a separate UI for connecting/disconnecting
 * Movement wallet for payments. Does not change user profile name or email.
 * 
 * Requirements: 7.1, 7.3 - Separate wallet connection that doesn't affect profile identity
 */
export function WalletConnection({ onWalletConnected, onWalletDisconnected }: WalletConnectionProps) {
  const { account, connected, wallets, connect, disconnect } = useMovementWallet();
  const { userId, userProfile } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Get address as string
  const address = account?.address?.toString() ?? null;

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard.',
      });
    }
  };

  // Handle wallet connection
  const handleConnect = async (walletName: string) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in before connecting a wallet.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Connect to wallet
      const result = await connect(walletName);

      if (!result.success) {
        throw new Error(result.error || 'Failed to connect wallet');
      }

      // Get the connected address
      const connectedAddress = account?.address?.toString();

      if (!connectedAddress) {
        throw new Error('No address found after connection');
      }

      // Update user profile with wallet address via API
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/users/${userId}/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: connectedAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile with wallet address');
      }

      // Get updated profile from backend to ensure UI reflects correct data
      const profileResponse = await response.json();
      if (profileResponse.success && profileResponse.profile) {
        // Update localStorage with the fresh profile data from backend
        localStorage.setItem('layR_userProfile', JSON.stringify(profileResponse.profile));
      }

      toast({
        title: 'Wallet Connected',
        description: 'Your Movement wallet has been connected successfully.',
      });

      onWalletConnected?.(connectedAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    if (!userId) {
      return;
    }

    setIsDisconnecting(true);

    try {
      // Disconnect from wallet
      await disconnect();

      // Remove wallet address from user profile via API
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/users/${userId}/wallet`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove wallet address from profile');
      }

      // Get updated profile from backend to ensure UI reflects correct data
      const profileResponse = await response.json();
      if (profileResponse.success && profileResponse.profile) {
        // Update localStorage with the fresh profile data from backend
        localStorage.setItem('layR_userProfile', JSON.stringify(profileResponse.profile));
      }

      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected. Your profile data remains unchanged.',
      });

      onWalletDisconnected?.();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast({
        title: 'Disconnection Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect wallet.',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Movement Wallet
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Connect your Movement wallet for payments. This does not change your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected && address ? (
          <>
            {/* Connected State */}
            <div className="flex items-center justify-between p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      Connected
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-white mt-1">{formatAddress(address)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={copyAddress}
                variant="outline"
                className="flex-1 border-neutral-700 text-white hover:bg-neutral-800"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </>
                )}
              </Button>
              <Button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                variant="outline"
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>

            {/* Full Address */}
            <div className="p-3 bg-neutral-800/30 border border-neutral-700 rounded">
              <p className="text-xs text-neutral-400 mb-1">Full Address</p>
              <p className="text-xs font-mono text-white break-all">{address}</p>
            </div>
          </>
        ) : (
          <>
            {/* Disconnected State */}
            <div className="flex items-center justify-between p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-700/50 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-neutral-800 text-neutral-400 border-neutral-700">
                    Not Connected
                  </Badge>
                  <p className="text-sm text-neutral-400 mt-1">No wallet connected</p>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isConnecting || !userId}
                  className="w-full bg-white text-black hover:bg-neutral-200"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-white w-64">
                <DropdownMenuLabel className="text-neutral-400">Select Wallet</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-800" />
                {wallets.length > 0 ? (
                  wallets.map((wallet) => (
                    <DropdownMenuItem
                      key={wallet.name}
                      onClick={() => handleConnect(wallet.name)}
                      className="hover:bg-neutral-800 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {wallet.icon && (
                          <img
                            src={wallet.icon}
                            alt={wallet.name}
                            className="w-5 h-5"
                          />
                        )}
                        <span>{wallet.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled className="text-neutral-500">
                    No wallets detected. Please install Petra or Razor wallet.
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {!userId && (
              <p className="text-xs text-neutral-400 text-center">
                Please log in to connect a wallet
              </p>
            )}
          </>
        )}

        {/* Info Note */}
        <div className="pt-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-400">
            Your wallet is used for payments only. Connecting or disconnecting your wallet does not affect your profile name, email, or other account information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
