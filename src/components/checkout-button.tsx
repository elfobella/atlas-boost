"use client"

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  game: 'lol' | 'valorant';
  currentRank: string;
  currentDivision: string | number;
  targetRank: string;
  targetDivision: string | number;
  price: number;
  customerEmail?: string;
}

export function CheckoutButton({ 
  game, 
  currentRank, 
  currentDivision, 
  targetRank, 
  targetDivision, 
  price, 
  customerEmail 
}: CheckoutButtonProps) {
  const t = useTranslations('rankSelector');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game,
          currentRank,
          currentDivision,
          targetRank,
          targetDivision,
          price,
          customerEmail: customerEmail || 'guest@atlastboost.com'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Ödeme başlatılamadı. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Yükleniyor...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>{t('proceedToPayment')}</span>
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
