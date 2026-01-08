import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Download, Eye, ExternalLink } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  zipFileUrl?: string;
  previewImages?: string[];
}

interface Purchase {
  _id: string;
  projectId: Project;
  accessType: 'demo' | 'download';
  amount: number;
  txHash: string;
  purchaseDate: string;
}

interface MyPurchasesTabProps {
  userId: string;
}

export function MyPurchasesTab({ userId }: MyPurchasesTabProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [demoPurchases, setDemoPurchases] = useState<Purchase[]>([]);
  const [downloadPurchases, setDownloadPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE}/api/payments/purchases/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch purchases');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setPurchases(data.data.purchases || []);
          setDemoPurchases(data.data.demoPurchases || []);
          setDownloadPurchases(data.data.downloadPurchases || []);
        }
      } catch (err) {
        console.error('[MyPurchasesTab] Error fetching purchases:', err);
        setError('Failed to load purchases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [userId]);

  const handleDownload = (purchase: Purchase) => {
    if (purchase.projectId.zipFileUrl) {
      window.open(purchase.projectId.zipFileUrl, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
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

  const renderPurchaseCard = (purchase: Purchase) => {
    const project = purchase.projectId;
    const isDownload = purchase.accessType === 'download';
    
    return (
      <div
        key={purchase._id}
        className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm overflow-hidden hover:border-neutral-700 transition-colors"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
        
        <div className="relative p-6">
          <div className="flex gap-6">
            {/* Preview Image */}
            <div className="flex-shrink-0">
              <img
                src={
                  project.previewImages?.[0] ||
                  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=150&fit=crop'
                }
                alt={project.title}
                className="w-32 h-24 object-cover rounded-sm border border-neutral-700"
              />
            </div>

            {/* Purchase Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/repository/${project.slug}`}
                    className="font-heading text-lg font-semibold text-white hover:text-neutral-300 transition-colors line-clamp-1"
                  >
                    {project.title}
                  </Link>
                  <p className="text-sm text-neutral-400 line-clamp-2 mt-1">
                    {project.description}
                  </p>
                </div>
                
                {/* Access Type Badge */}
                <div>
                  {isDownload ? (
                    <span className="px-3 py-1 bg-green-900/30 border border-green-700 text-green-400 text-xs font-medium rounded-sm flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Full Access
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-900/30 border border-blue-700 text-blue-400 text-xs font-medium rounded-sm flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Demo Access
                    </span>
                  )}
                </div>
              </div>

              {/* Purchase Details */}
              <div className="flex items-center gap-4 mb-4 text-sm text-neutral-400">
                <span>Purchased: {formatDate(purchase.purchaseDate)}</span>
                <span>•</span>
                <span>{purchase.amount} MOVE</span>
                <span>•</span>
                <a
                  href={`https://explorer.movementlabs.xyz/txn/${purchase.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Tx: {truncateTxHash(purchase.txHash)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  to={`/repository/${project.slug}`}
                  className="px-4 py-2 border border-neutral-700 text-white hover:bg-neutral-800 transition-colors rounded-sm text-sm"
                >
                  View Project
                </Link>
                {isDownload && project.zipFileUrl && (
                  <button
                    onClick={() => handleDownload(purchase)}
                    className="px-4 py-2 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm text-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-white">My Purchases</h2>
        <p className="text-sm text-neutral-400 mt-1">
          {purchases.length} {purchases.length === 1 ? 'purchase' : 'purchases'}
        </p>
      </div>

      {purchases.length === 0 ? (
        <div className="relative bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-sm p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-sm pointer-events-none" />
          
          <div className="relative">
            <div className="w-16 h-16 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-white mb-2">
              No purchases yet
            </h3>
            <p className="text-neutral-400 mb-6">
              Browse the marketplace to find projects you'd like to access
            </p>
            <Link
              to="/repositories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium hover:bg-neutral-200 transition-colors rounded-sm"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Download Purchases Section */}
          {downloadPurchases.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-400" />
                <h3 className="font-heading text-lg font-semibold text-white">
                  Full Access ({downloadPurchases.length})
                </h3>
              </div>
              <div className="space-y-4">
                {downloadPurchases.map(renderPurchaseCard)}
              </div>
            </div>
          )}

          {/* Demo Purchases Section */}
          {demoPurchases.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <h3 className="font-heading text-lg font-semibold text-white">
                  Demo Access ({demoPurchases.length})
                </h3>
              </div>
              <div className="space-y-4">
                {demoPurchases.map(renderPurchaseCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
