import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, ExternalLink, Filter } from 'lucide-react';

interface TransactionProject {
  id: string;
  title: string;
  slug: string;
  category: string;
}

interface TransactionUser {
  id: string;
  name: string;
  email: string;
}

interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  projectId: string;
  projectTitle: string;
  projectSlug: string;
  projectCategory: string;
  amount: number;
  transactionType: 'demo_purchase' | 'download_purchase';
  date: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  from: TransactionUser;
  to: TransactionUser;
}

interface TransactionSummary {
  totalIncoming: number;
  totalOutgoing: number;
}

interface TransactionsTabProps {
  userId: string;
}

type FilterType = 'all' | 'incoming' | 'outgoing';

export function TransactionsTab({ userId }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncoming: 0,
    totalOutgoing: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const filterParam = filter !== 'all' ? `?type=${filter}` : '';
        const response = await fetch(`${API_BASE}/api/transactions/${userId}${filterParam}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        
        if (data.success) {
          setTransactions(data.transactions || []);
          setSummary(data.summary || { totalIncoming: 0, totalOutgoing: 0 });
        }
      } catch (err) {
        console.error('[TransactionsTab] Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateTxHash = (hash: string) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900/30 border-green-700 text-green-400';
      case 'pending':
        return 'bg-yellow-900/30 border-yellow-700 text-yellow-400';
      case 'failed':
        return 'bg-red-900/30 border-red-700 text-red-400';
      default:
        return 'bg-neutral-800 border-neutral-700 text-neutral-400';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'demo_purchase':
        return 'Demo Access';
      case 'download_purchase':
        return 'Full Download';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-neutral-800/50 rounded-sm animate-pulse" />
        <div className="h-32 bg-neutral-800/50 rounded-sm animate-pulse" />
        <div className="h-32 bg-neutral-800/50 rounded-sm animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 p-4 bg-red-900/20 border border-red-800 rounded-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-white mb-4">Transactions</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownLeft className="w-5 h-5 text-green-400" />
                <p className="text-sm text-neutral-400">Total Earnings</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {summary.totalIncoming.toFixed(2)} MOVE
              </p>
            </div>
          </div>
          
          <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-5 h-5 text-red-400" />
                <p className="text-sm text-neutral-400">Total Spent</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {summary.totalOutgoing.toFixed(2)} MOVE
              </p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-sm text-sm transition-colors ${
              filter === 'all'
                ? 'bg-white text-black font-medium'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('incoming')}
            className={`px-3 py-1 rounded-sm text-sm transition-colors ${
              filter === 'incoming'
                ? 'bg-white text-black font-medium'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Incoming
          </button>
          <button
            onClick={() => setFilter('outgoing')}
            className={`px-3 py-1 rounded-sm text-sm transition-colors ${
              filter === 'outgoing'
                ? 'bg-white text-black font-medium'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Outgoing
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
          
          <div className="relative">
            <div className="w-16 h-16 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-white mb-2">
              No transactions yet
            </h3>
            <p className="text-neutral-400">
              {filter === 'incoming'
                ? 'You haven\'t received any payments yet'
                : filter === 'outgoing'
                ? 'You haven\'t made any purchases yet'
                : 'Your transaction history will appear here'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const isIncoming = transaction.type === 'incoming';
            
            return (
              <div
                key={transaction.id}
                className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm overflow-hidden hover:border-neutral-700 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
                
                <div className="relative p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Transaction Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Direction Icon */}
                      <div
                        className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${
                          isIncoming
                            ? 'bg-green-900/30 border border-green-700'
                            : 'bg-red-900/30 border border-red-700'
                        }`}
                      >
                        {isIncoming ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Link
                            to={`/repository/${transaction.projectSlug}`}
                            className="font-semibold text-white hover:text-neutral-300 transition-colors line-clamp-1"
                          >
                            {transaction.projectTitle}
                          </Link>
                          <span
                            className={`text-lg font-bold flex-shrink-0 ${
                              isIncoming ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {isIncoming ? '+' : '-'}{transaction.amount.toFixed(2)} MOVE
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-neutral-400 mb-2">
                          <span>{getTransactionTypeLabel(transaction.transactionType)}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.date)}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 border rounded-sm text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-neutral-500">
                            {isIncoming ? 'From' : 'To'}:
                          </span>
                          <span className="text-neutral-400">
                            {isIncoming ? transaction.from.name : transaction.to.name}
                          </span>
                          {transaction.txHash && (
                            <>
                              <span className="text-neutral-600">•</span>
                              <a
                                href={`https://explorer.movementlabs.xyz/txn/${transaction.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                              >
                                {truncateTxHash(transaction.txHash)}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
