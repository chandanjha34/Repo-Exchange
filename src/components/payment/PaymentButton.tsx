import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentModal } from './PaymentModal';
import { Loader2 } from 'lucide-react';

interface PaymentButtonProps {
  projectId: string;
  projectTitle: string;
  accessType: 'demo' | 'download';
  price: number; // in MOVE
  onSuccess?: () => void;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
}

/**
 * PaymentButton Component
 * 
 * Triggers payment modal on click
 * Requirements: 1.1, 6.1
 */
export function PaymentButton({
  projectId,
  projectTitle,
  accessType,
  price,
  onSuccess,
  children,
  className,
  variant = 'default',
  disabled = false,
}: PaymentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = () => {
    if (!disabled && !isProcessing) {
      setIsModalOpen(true);
    }
  };

  const handleSuccess = () => {
    setIsProcessing(false);
    setIsModalOpen(false);
    onSuccess?.();
  };

  const handleClose = () => {
    if (!isProcessing) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        variant={variant}
        className={className}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          children || `Pay ${price} MOVE`
        )}
      </Button>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleClose}
        projectId={projectId}
        projectTitle={projectTitle}
        accessType={accessType}
        price={price}
        onSuccess={handleSuccess}
      />
    </>
  );
}
