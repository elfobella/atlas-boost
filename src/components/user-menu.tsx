"use client"

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LogOut, Settings, Package, Loader2 } from 'lucide-react';

export function UserMenu() {
  const t = useTranslations('auth');
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/signin"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          {t('signIn')}
        </Link>
        <Link
          href="/auth/signup"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t('signUp')}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt={session.user.name || ''} className="rounded-full w-full h-full object-cover" />
          ) : (
            session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <span className="text-sm font-medium text-foreground hidden md:block">
          {session.user.name || session.user.email}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 z-50 w-56 rounded-md border border-border bg-background shadow-lg">
            <div className="p-1">
              {/* User Info */}
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
              </div>

              {/* Menu Items */}
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors mt-1"
                onClick={() => setIsOpen(false)}
              >
                <Package className="h-4 w-4" />
                <span className="text-sm">{t('myOrders')}</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">{t('settings')}</span>
              </Link>

              <hr className="my-1 border-border" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">{t('signOut')}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
