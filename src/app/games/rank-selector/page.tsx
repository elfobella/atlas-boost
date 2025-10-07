"use client"

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { ArrowLeft } from "lucide-react";
import { GameSelector } from "@/components/game-selector";
import { RankSelector } from "@/components/rank-selector";
import { CheckoutButton } from "@/components/checkout-button";

export default function RankSelectorPage() {
  const t = useTranslations('rankSelector');
  const [selectedGame, setSelectedGame] = useState<'lol' | 'valorant' | null>(null);
  const [selectedBoost, setSelectedBoost] = useState<{
    currentRank: string;
    currentDivision: string | number;
    targetRank: string;
    targetDivision: string | number;
    price: number;
  } | null>(null);

  const handleRankSelect = useCallback((
    currentRank: string,
    currentDivision: string | number,
    targetRank: string,
    targetDivision: string | number,
    price: number
  ) => {
    setSelectedBoost({
      currentRank,
      currentDivision,
      targetRank,
      targetDivision,
      price
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('backToHome')}</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">{t('orderProgress')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('orderSubtitle')}
            </p>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                selectedGame ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <span className={`text-sm ${selectedGame ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t('step1')}
              </span>
            </div>
            
            <div className="flex-1 h-px bg-border mx-4"></div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                selectedBoost ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className={`text-sm ${selectedBoost ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t('step2')}
              </span>
            </div>
            
            <div className="flex-1 h-px bg-border mx-4"></div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className="text-sm text-muted-foreground">
                {t('step3')}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!selectedGame ? (
            <GameSelector 
              selectedGame={selectedGame} 
              onGameSelect={setSelectedGame} 
            />
          ) : (
            <RankSelector 
              game={selectedGame} 
              onRankSelect={handleRankSelect}
            />
          )}
        </div>

        {/* Boost Summary & Actions */}
        {selectedBoost && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {t('boostSummary')}
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('game')}:</span>
                  <span className="font-medium text-foreground">
                    {selectedGame === 'lol' ? 'League of Legends' : 'Valorant'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('currentRankLabel')}:</span>
                  <span className="font-medium text-foreground">
                    {selectedBoost.currentRank} {selectedBoost.currentDivision}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('targetRankLabel')}:</span>
                  <span className="font-medium text-foreground">
                    {selectedBoost.targetRank} {selectedBoost.targetDivision}
                  </span>
                </div>
                
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">{t('totalPrice')}:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${selectedBoost.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setSelectedGame(null);
                    setSelectedBoost(null);
                  }}
                  className="flex-1 px-6 py-3 border border-input bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {t('goBack')}
                </button>
                
                <div className="flex-1">
                  <CheckoutButton
                    game={selectedGame}
                    currentRank={selectedBoost.currentRank}
                    currentDivision={selectedBoost.currentDivision}
                    targetRank={selectedBoost.targetRank}
                    targetDivision={selectedBoost.targetDivision}
                    price={selectedBoost.price}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-card border border-border rounded-lg">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 dark:text-green-400 text-xl">⚡</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{t('fastDeliveryFeature')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('fastDeliveryDesc')}
                </p>
              </div>
              
              <div className="text-center p-4 bg-card border border-border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">🛡️</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{t('safeFeature')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('safeDesc')}
                </p>
              </div>
              
              <div className="text-center p-4 bg-card border border-border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">👑</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{t('expertFeature')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('expertDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Game Selection */}
        {selectedGame && !selectedBoost && (
          <div className="max-w-2xl mx-auto mt-8 text-center">
            <button
              onClick={() => {
                setSelectedGame(null);
                setSelectedBoost(null);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Farklı oyun seç
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
