import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price for display with consistent formatting
 * Shows "Free" for 0 price, otherwise shows price with MOVE currency
 * Prices are stored directly in MOVE (e.g., 0.1, 1.0)
 */
export function formatPrice(price: number | undefined): string {
  if (!price || price === 0) return 'Free';

  // Format with appropriate decimal places
  // Prices are already in MOVE, no conversion needed
  if (price >= 1) {
    return `${price.toFixed(2)} MOVE`;
  } else {
    return `${price.toFixed(4)} MOVE`;
  }
}
