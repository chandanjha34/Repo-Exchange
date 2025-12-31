import { useState } from "react";
import { Copy, Check, ArrowUpRight, ArrowDownLeft, ExternalLink, Loader2, Wallet, RefreshCw, AlertCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { getExplorerUrl } from "@/lib/wallet-api";

export function WalletProfileSection() {
  const {
    address,
    balance,
    transactions,
    isLoadingBalance,
    isLoadingTransactions,
    isSending,
    refreshBalance,
    refreshTransactions,
    sendTransaction,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "send" | "receive">("overview");
  
  // Send form state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateHash = (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`;

  const handleRefresh = async () => {
    await Promise.all([refreshBalance(), refreshTransactions()]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;

    setSendError(null);
    const result = await sendTransaction(recipient, amount);
    
    if (result.success) {
      setSendSuccess(true);
      setTxHash(result.txHash || null);
      
      setTimeout(() => {
        setSendSuccess(false);
        setTxHash(null);
        setRecipient("");
        setAmount("");
        setActiveTab("overview");
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

  return (
    <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm overflow-hidden">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-800 rounded-sm flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-white">Wallet</h2>
                <p className="text-sm text-neutral-400">Manage your funds</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={isLoadingBalance || isLoadingTransactions}
              className="p-2 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${(isLoadingBalance || isLoadingTransactions) ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Address */}
          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-sm">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Wallet Address</p>
              <p className="text-sm font-mono text-white">{address || "Not connected"}</p>
            </div>
            <button
              onClick={copyAddress}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="p-6 border-b border-neutral-800 text-center">
          <p className="text-sm text-neutral-400 mb-2">Total Balance</p>
          {isLoadingBalance ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
          ) : balance ? (
            <>
              <p className="font-heading text-4xl font-bold text-white mb-1">
                {balance.balance} {balance.symbol}
              </p>
              <p className="text-sm text-neutral-500">≈ ${balance.balanceUsd} USD</p>
            </>
          ) : (
            <>
              <p className="font-heading text-4xl font-bold text-white mb-1">0.00</p>
              <p className="text-sm text-neutral-500">Unable to fetch balance</p>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "text-white border-b-2 border-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("send")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "send"
                ? "text-white border-b-2 border-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Send
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "receive"
                ? "text-white border-b-2 border-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Receive
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div>
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setActiveTab("send")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm text-sm"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Send
                </button>
                <button
                  onClick={() => setActiveTab("receive")}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-700 text-white font-medium hover:bg-neutral-800 transition-colors rounded-sm text-sm"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Receive
                </button>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-4">Transaction History</h3>
                {isLoadingTransactions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((tx, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-sm hover:bg-neutral-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-neutral-700">
                            {tx.type === "send" ? (
                              <ArrowUpRight className="w-5 h-5 text-white" />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">
                              {tx.type === "send" ? "Sent" : "Received"}
                            </p>
                            <p className="text-xs text-neutral-500 font-mono">
                              {truncateHash(tx.hash)}
                            </p>
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
                        <a
                          href={getExplorerUrl(tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2 text-neutral-500 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-500">No transactions yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "send" && (
            <div>
              {sendSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-neutral-800 rounded-sm flex items-center justify-center">
                    <Check className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="text-xl text-white font-medium">Transaction Sent!</p>
                  <p className="text-sm text-neutral-400 mt-2">Your transaction is being processed</p>
                  {txHash && (
                    <p className="text-xs text-neutral-500 font-mono mt-2">
                      {txHash.slice(0, 16)}...{txHash.slice(-12)}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1 bg-neutral-700 rounded-sm disabled:opacity-50"
                      >
                        MAX
                      </button>
                    </div>
                    {balance && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Available: {balance.balance} {balance.symbol}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSending || !recipient || !amount}
                    className="w-full px-4 py-3 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
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
                </form>
              )}
            </div>
          )}

          {activeTab === "receive" && (
            <div className="text-center">
              <p className="text-sm text-neutral-400 mb-6">
                Share your wallet address to receive funds
              </p>
              
              {/* QR Code Placeholder */}
              <div className="w-48 h-48 mx-auto mb-6 bg-white p-3 rounded-sm">
                <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-sm">
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">QR Code</p>
                    <p className="text-xs text-neutral-400 mt-1">Scan to receive</p>
                  </div>
                </div>
              </div>

              {/* Full Address */}
              <div className="text-left">
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Wallet Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={address || ""}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
