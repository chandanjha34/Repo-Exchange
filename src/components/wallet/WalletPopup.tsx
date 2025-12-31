import { useState, useRef, useEffect } from "react";
import { X, Copy, Check, ArrowUpRight, ArrowDownLeft, RefreshCw, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { WalletActions } from "./WalletActions";

interface WalletPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletPopup({ isOpen, onClose }: WalletPopupProps) {
  const { 
    address, 
    balance, 
    transactions, 
    isLoadingBalance, 
    isLoadingTransactions,
    refreshBalance,
    refreshTransactions,
    sendTransaction,
    isSending
  } = useWallet();
  
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<"main" | "send" | "receive">("main");
  const popupRef = useRef<HTMLDivElement>(null);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const truncateHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-6)}`;

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refreshBalance(), refreshTransactions()]);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Reset view when closing
  useEffect(() => {
    if (!isOpen) setActiveView("main");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={popupRef} className="absolute top-full right-0 mt-2 w-[340px] bg-neutral-900 border border-neutral-800 rounded-sm shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <h3 className="font-heading text-lg font-semibold text-white">
          {activeView === "main" && "Wallet"}
          {activeView === "send" && "Send"}
          {activeView === "receive" && "Receive"}
        </h3>
        <div className="flex items-center gap-2">
          {activeView === "main" && (
            <button 
              onClick={handleRefresh} 
              disabled={isLoadingBalance || isLoadingTransactions}
              className="p-1 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${(isLoadingBalance || isLoadingTransactions) ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button 
            onClick={activeView === "main" ? onClose : () => setActiveView("main")} 
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {activeView === "main" && (
        <>
          {/* Address */}
          <div className="p-4 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Address</span>
              <button onClick={copyAddress} className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors">
                <span className="font-mono">{address ? truncateAddress(address) : "---"}</span>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="p-6 text-center border-b border-neutral-800">
            <p className="text-sm text-neutral-400 mb-1">Balance</p>
            {isLoadingBalance ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
              </div>
            ) : balance ? (
              <>
                <p className="font-heading text-3xl font-bold text-white">
                  {balance.balance} {balance.symbol}
                </p>
                <p className="text-sm text-neutral-500 mt-1">≈ ${balance.balanceUsd} USD</p>
              </>
            ) : (
              <>
                <p className="font-heading text-3xl font-bold text-white">0.00</p>
                <p className="text-sm text-neutral-500 mt-1">Unable to fetch balance</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-b border-neutral-800">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActiveView("send")} 
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm text-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                Send
              </button>
              <button 
                onClick={() => setActiveView("receive")} 
                className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-700 text-white font-medium hover:bg-neutral-800 transition-colors rounded-sm text-sm"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Receive
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-neutral-400 mb-3">Recent Transactions</h4>
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 4).map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-neutral-700">
                        {tx.type === "send" ? (
                          <ArrowUpRight className="w-4 h-4 text-white" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">
                          {tx.type === "send" ? "Sent" : "Received"}
                        </p>
                        <p className="text-xs text-neutral-500 font-mono">{truncateHash(tx.hash)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {tx.type === "send" ? "-" : "+"}{tx.amount}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {tx.status === "pending" ? (
                          <span className="text-yellow-500">Pending</span>
                        ) : tx.status === "failed" ? (
                          <span className="text-red-500">Failed</span>
                        ) : (
                          tx.timestamp
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-neutral-500">No transactions yet</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeView === "send" && (
        <WalletActions 
          mode="send" 
          onBack={() => setActiveView("main")} 
          walletAddress={address}
          balance={balance}
          onSend={sendTransaction}
          isSending={isSending}
        />
      )}

      {activeView === "receive" && (
        <WalletActions 
          mode="receive" 
          onBack={() => setActiveView("main")} 
          walletAddress={address}
        />
      )}
    </div>
  );
}
