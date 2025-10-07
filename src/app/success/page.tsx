"use client"

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Loader2, Package, Clock, Mail } from 'lucide-react';

function SuccessContent() {
  const t = useTranslations('success');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Optionally fetch session details
      setLoading(false);
      // You can fetch session details from your API if needed
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {loading ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-3 text-center">
              {t('title')} 🎉
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 text-center">
              {t('subtitle')}
            </p>

            {/* Session ID */}
            {sessionId && (
              <div className="bg-muted/50 rounded-lg p-4 mb-8">
                <p className="text-sm text-muted-foreground mb-1">{t('orderId')}:</p>
                <p className="font-mono text-xs text-foreground break-all">{sessionId}</p>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground mb-1">{t('orderStatus')}</h3>
                <p className="text-sm text-muted-foreground">{t('preparing')}</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground mb-1">{t('estimatedTime')}</h3>
                <p className="text-sm text-muted-foreground">2-6 {t('days')}</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground mb-1">{t('notifications')}</h3>
                <p className="text-sm text-muted-foreground">{t('emailSent')}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-3">📋 {t('nextSteps')}</h3>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">1.</span>
                  <span>{t('step1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">2.</span>
                  <span>{t('step2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">3.</span>
                  <span>{t('step3')}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">4.</span>
                  <span>{t('step4')}</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="block w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-center font-medium"
              >
                {t('viewOrders')}
              </Link>
              
              <Link
                href="/"
                className="block w-full border border-input bg-background px-6 py-3 rounded-md hover:bg-accent transition-colors text-center font-medium"
              >
                {t('backToHome')}
              </Link>
            </div>

            {/* Support */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {t('haveQuestion')}
              </p>
              <Link 
                href="/contact" 
                className="text-sm text-primary hover:underline"
              >
                {t('contactSupport')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
