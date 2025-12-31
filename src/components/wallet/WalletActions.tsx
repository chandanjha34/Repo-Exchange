import { useState } from "react";
import { Copy, Check, Loader2, ArrowUpRight, AlertCircle } from "lucide-react";
import { WalletBalance } from "@/lib/wallet-api";

interface WalletActionsProps {
  mode: "send" | "receive";
  onBack: () => void;
  walletAddress?: string | null;
  balance?: WalletBalance | null;
  onSend?: (toAddress: string, amount: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  isSending?: boolean;
}

export function WalletActions({ mode, onBack, walletAddress, balance, onSend, isSending }: WalletActionsProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount || !onSend) return;

    setSendError(null);
    const result = await onSend(recipient, amount);
    
    if (result.success) {
      setSendSuccess(true);
      setTxHash(result.txHash || null);
      
      // Reset after showing success
      setTimeout(() => {
        setSendSuccess(false);
        setTxHash(null);
        setRecipient("");
        setAmount("");
        onBack();
      }, 3000);
    } else {
      setSendError(result.error || "Transaction failed");
    }
  };

  const setMaxAmount = () => {
    if (balance) {
      setAmount(balance.balance);
    }
  };

  if (mode === "receive") {
    return (
      <div className="p-4">
        <div className="mb-6">
          <p className="text-sm text-neutral-400 mb-4 text-center">
            Share your wallet address to receive funds
          </p>
          
          {/* QR Code Placeholder - In production, use a QR library */}
          <div className="w-48 h-48 mx-auto mb-4 bg-white p-3 rounded-sm">
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-sm">
              <div className="text-center">
                <p className="text-xs text-neutral-500">QR Code</p>
                <p className="text-xs text-neutral-400 mt-1">Scan to receive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Wallet Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={walletAddress || ""}
              readOnly
              className="w-full px-4 py-3 pr-12 bg-neutral-800 border border-neutral-700 text-white text-sm font-mono focus:outline-none rounded-sm"
            />
            <button
              onClick={copyAddress}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full px-4 py-3 border border-neutral-700 text-white font-medium hover:bg-neutral-800 transition-colors rounded-sm text-sm"
        >
          Done
        </button>
      </div>
    );
  }

  // Send mode
  return (
    <div className="p-4">
      {sendSuccess ? (
        <div className="py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-neutral-800 rounded-sm flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-white font-medium">Transaction Sent!</p>
          <p className="text-sm text-neutral-400 mt-1">Your transaction is being processed</p>
          {txHash && (
            <p className="text-xs text-neutral-500 font-mono mt-2">
              {txHash.slice(0, 12)}...{txHash.slice(-8)}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          {sendError && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-400">{sendError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter wallet address"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 text-sm font-mono focus:outline-none focus:border-neutral-600 rounded-sm"
              required
              disabled={isSending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Amount {balance && `(${balance.symbol})`}
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.0001"
                min="0"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-neutral-600 rounded-sm"
                required
                disabled={isSending}
              />
              <button
                type="button"
                onClick={setMaxAmount}
                disabled={!balance || isSending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
              >
                MAX
              </button>
            </div>
            {balance && (
              <p className="text-xs text-neutral-500 mt-1">
                Available: {balance.balance} {balance.symbol}
              </p>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSending || !recipient || !amount}
              className="w-full px-4 py-3 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={isSending}
              className="w-full px-4 py-3 border border-neutral-700 text-white font-medium hover:bg-neutral-800 transition-colors rounded-sm text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
