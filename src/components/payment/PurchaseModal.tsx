import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayment, PaymentState } from '@/hooks/usePayment';
import { useMovementWallet } from '@/hooks/useMovementWallet';
import { parsePaymentError } from '@/types/payment-errors';
import { Project } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Wallet,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Eye,
  Download,
  Check,
} from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  accessType: 'demo' | 'download';
  onSuccess: () => void;
}

/**
 * PurchaseModal Component
 * 
 * Shows price and what's included, checks wallet connection, initiates payment flow
 * Requirements: 9.2, 10.2
 */
export function PurchaseModal({
  isOpen,
  onClose,
  project,
  accessType,
  onSuccess,
}: PurchaseModalProps) {
  const { initiatePayment, paymentState, error, reset, isLoading } = usePayment();
  const { connected, wallets, connect } = useMovementWallet();

  const price = accessType === 'demo' ? project.demoPrice : project.downloadPrice;
  const accessLabel = accessType === 'demo' ? 'Demo Access' : 'Full Download';

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Call onSuccess when payment succeeds
  useEffect(() => {
    if (paymentState.status === 'success') {
      onSuccess();
    }
  }, [paymentState.status, onSuccess]);

  const handlePayment = async () => {
    // Check if wallet is connected
    if (!connected) {
      return;
    }
    await initiatePayment(project._id, accessType);
  };

  const handleRetry = () => {
    reset();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // What's included based on access type
  const includedFeatures = accessType === 'demo' 
    ? [
        'View project details and documentation',
        'Access to README and preview images',
        'See technology stack and architecture',
        'View code structure and organization',
      ]
    : [
        'Complete source code download',
        'All project files and assets',
        'Full documentation and guides',
        'Lifetime access to updates',
        'Commercial usage rights',
      ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            {paymentState.status === 'success' ? 'Purchase Complete!' : `Purchase ${accessLabel}`}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            {paymentState.status === 'success'
              ? 'Your access has been granted'
              : project.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Wallet Connection Check */}
          {!connected && paymentState.status === 'idle' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-sm border border-yellow-500/30">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-400">Wallet Not Connected</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Please connect your Movement wallet to continue with the payment.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Select a wallet to connect:</p>
                {wallets.length > 0 ? (
                  <div className="grid gap-2">
                    {wallets.map((wallet) => (
                      <Button
                        key={wallet.name}
                        onClick={() => connect(wallet.name)}
                        variant="outline"
                        className="w-full justify-start gap-3 border-neutral-700 hover:bg-neutral-800"
                      >
                        {wallet.icon && (
                          <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                        )}
                        <span>{wallet.name}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
                    <p className="text-sm text-neutral-400">
                      No Movement wallets detected. Please install{' '}
                      <a
                        href="https://petra.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white underline hover:text-neutral-300"
                      >
                        Petra
                      </a>
                      {' '}or{' '}
                      <a
                        href="https://razorwallet.xyz/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white underline hover:text-neutral-300"
                      >
                        Razor
                      </a>
                      {' '}wallet extension.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purchase Details */}
          {connected && paymentState.status !== 'success' && paymentState.status !== 'error' && (
            <div className="space-y-4">
              {/* Access Type Badge */}
              <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
                <div className="flex items-center gap-3">
                  {accessType === 'demo' ? (
                    <Eye className="w-5 h-5 text-white" />
                  ) : (
                    <Download className="w-5 h-5 text-white" />
                  )}
                  <div>
                    <p className="font-medium text-white">{accessLabel}</p>
                    <p className="text-sm text-neutral-400">{project.title}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-neutral-700 text-white">
                  {accessType === 'demo' ? 'Demo' : 'Full'}
                </Badge>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
                <div>
                  <p className="text-sm text-neutral-400">Total Amount</p>
                  <p className="text-2xl font-bold text-white">
                    {formatPrice(price)}
                  </p>
                </div>
              </div>

              {/* What's Included */}
              <div className="p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
                <p className="font-medium text-white mb-3">What's Included:</p>
                <ul className="space-y-2">
                  {includedFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-neutral-400">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Payment State Display */}
          <PaymentStateDisplay paymentState={paymentState} error={error} />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {paymentState.status === 'idle' && (
              <>
                {connected ? (
                  <>
                    <Button
                      onClick={handlePayment}
                      className="flex-1 bg-white text-black hover:bg-neutral-200"
                      disabled={isLoading}
                    >
                      <Wallet className="w-4 h-4" />
                      {price === 0 ? 'Get Access' : `Pay ${formatPrice(price)}`}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}

            {paymentState.status === 'error' && (
              <>
                {parsePaymentError(paymentState.error || error).recoverable ? (
                  <>
                    <Button
                      onClick={handleRetry}
                      className="flex-1 bg-white text-black hover:bg-neutral-200"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry Payment
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleClose}
                    className="flex-1 bg-white text-black hover:bg-neutral-200"
                  >
                    Close
                  </Button>
                )}
              </>
            )}

            {paymentState.status === 'success' && (
              <Button
                onClick={handleClose}
                className="flex-1 bg-white text-black hover:bg-neutral-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                Done
              </Button>
            )}

            {isLoading && (
              <Button
                disabled
                className="flex-1 bg-neutral-700 text-neutral-400 cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * PaymentStateDisplay Component
 * 
 * Displays current payment state with appropriate UI
 */
function PaymentStateDisplay({
  paymentState,
  error,
}: {
  paymentState: PaymentState;
  error: string | null;
}) {
  switch (paymentState.status) {
    case 'idle':
      return null;

    case 'initiating':
      return (
        <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <div>
            <p className="font-medium">Initiating payment...</p>
            <p className="text-sm text-neutral-400">Preparing transaction details</p>
          </div>
        </div>
      );

    case 'signing':
      return (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-sm border border-blue-500/30">
          <Wallet className="w-5 h-5 text-blue-400" />
          <div>
            <p className="font-medium text-blue-400">Waiting for signature</p>
            <p className="text-sm text-neutral-400">
              Please approve the transaction in your wallet
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Amount: {paymentState.amount} MOVE
            </p>
          </div>
        </div>
      );

    case 'broadcasting':
      return (
        <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <div>
            <p className="font-medium">Broadcasting transaction...</p>
            <p className="text-sm text-neutral-400">Sending to Movement blockchain</p>
            <p className="text-xs text-neutral-500 mt-1 font-mono truncate">
              {paymentState.txHash}
            </p>
          </div>
        </div>
      );

    case 'confirming':
      return (
        <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <div>
            <p className="font-medium">Confirming transaction...</p>
            <p className="text-sm text-neutral-400">Waiting for blockchain confirmation</p>
            <p className="text-xs text-neutral-500 mt-1 font-mono truncate">
              {paymentState.txHash}
            </p>
          </div>
        </div>
      );

    case 'granting_access':
      return (
        <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <div>
            <p className="font-medium">Granting access...</p>
            <p className="text-sm text-neutral-400">Creating on-chain access record</p>
            <p className="text-xs text-neutral-500 mt-1 font-mono truncate">
              {paymentState.txHash}
            </p>
          </div>
        </div>
      );

    case 'success':
      return (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-sm border border-green-500/30">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <p className="font-medium text-green-400">Payment successful!</p>
            <p className="text-sm text-neutral-400">Your access has been granted</p>
            <p className="text-xs text-neutral-500 mt-1 font-mono truncate">
              {paymentState.txHash}
            </p>
          </div>
        </div>
      );

    case 'error':
      const errorInfo = parsePaymentError(paymentState.error || error);
      return (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-sm border border-red-500/30">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-400">{errorInfo.userMessage}</p>
              <p className="text-sm text-neutral-400 mt-1">
                {paymentState.error || error}
              </p>
            </div>
          </div>

          {/* Actionable Steps */}
          {errorInfo.actionableSteps.length > 0 && (
            <div className="p-4 bg-neutral-800/50 rounded-sm border border-neutral-700">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-neutral-300">What to do next:</p>
              </div>
              <ul className="space-y-1.5 ml-6">
                {errorInfo.actionableSteps.map((step, index) => (
                  <li key={index} className="text-sm text-neutral-400 list-disc">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Show retry availability */}
          {!errorInfo.recoverable && (
            <div className="p-3 bg-yellow-500/10 rounded-sm border border-yellow-500/30">
              <p className="text-xs text-yellow-400">
                This error cannot be automatically retried. Please follow the steps above.
              </p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
