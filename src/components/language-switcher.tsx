"use client"

import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import { useState } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = async (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
      >
        <Languages className="h-[1.2rem] w-[1.2rem]" />
        <span className="font-semibold uppercase">
          {locale === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
        </span>
        <span className="sr-only">Change language</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 z-50 w-48 rounded-md border border-border bg-background shadow-lg">
            <div className="p-1">
              <button
                onClick={() => {
                  changeLanguage('tr');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                  locale === 'tr'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇹🇷</span>
                  <span>Türkçe</span>
                </div>
              </button>

              <button
                onClick={() => {
                  changeLanguage('en');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                  locale === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇬🇧</span>
                  <span>English</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
