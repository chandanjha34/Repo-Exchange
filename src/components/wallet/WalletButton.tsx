import { useState } from "react";
import { Wallet } from "lucide-react";
import { WalletPopup } from "./WalletPopup";

export function WalletButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 transition-colors rounded-sm ${
          isOpen 
            ? "bg-neutral-800 text-white" 
            : "text-neutral-300 hover:text-white hover:bg-neutral-900"
        }`}
        aria-label="Open wallet"
      >
        <Wallet className="w-5 h-5" />
      </button>
      
      <WalletPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
