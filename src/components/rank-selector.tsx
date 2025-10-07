"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { ArrowUp, Clock, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import {
  validateRankBoost,
  getSuggestedTargets,
  getAvailableRanks,
  getDivisions,
  type ValidationResult,
  type RankSuggestion
} from "@/lib/rank-utils";

interface RankSelectorProps {
  game: 'lol' | 'valorant';
  onRankSelect: (currentRank: string, currentDivision: string | number, targetRank: string, targetDivision: string | number, price: number) => void;
}

export function RankSelector({ game, onRankSelect }: RankSelectorProps) {
  const t = useTranslations('rankSelector');
  const tErrors = useTranslations('errors');
  const [currentRank, setCurrentRank] = useState<string>('');
  const [currentDivision, setCurrentDivision] = useState<string | number>('');
  const [targetRank, setTargetRank] = useState<string>('');
  const [targetDivision, setTargetDivision] = useState<string | number>('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [suggestions, setSuggestions] = useState<RankSuggestion[]>([]);

  const gameName = game === 'lol' ? 'League of Legends' : 'Valorant';
  const gameImage = game === 'lol' ? '/images/LoL.jpeg' : '/images/Valorant.jpeg';

  // Current rank değiştiğinde target rank'leri güncelle
  useEffect(() => {
    if (currentRank) {
      setTargetRank('');
      setTargetDivision('');
      setValidation(null);
    }
  }, [game, currentRank]);

  // Current rank ve division değiştiğinde önerileri güncelle
  useEffect(() => {
    if (currentRank) {
      const newSuggestions = getSuggestedTargets(game, currentRank, currentDivision);
      setSuggestions(newSuggestions);
    }
  }, [game, currentRank, currentDivision]);

  // Target rank değiştiğinde validation yap
  useEffect(() => {
    if (currentRank && currentDivision && targetRank && targetDivision) {
      const result = validateRankBoost(game, currentRank, currentDivision, targetRank, targetDivision);
      setValidation(result);
      
      // Geçerli ise parent'a bilgi gönder
      if (result.valid && result.price) {
        onRankSelect(currentRank, currentDivision, targetRank, targetDivision, result.price);
      }
    } else {
      setValidation(null);
    }
  }, [game, currentRank, currentDivision, targetRank, targetDivision, onRankSelect]);

  const availableRanks = getAvailableRanks(game, currentRank);
  const currentDivisions = currentRank ? getDivisions(game, currentRank) : [];
  const targetDivisions = targetRank ? getDivisions(game, targetRank) : [];

  return (
    <div className="space-y-8">
      {/* Selected Game Header */}
      <div className="relative overflow-hidden rounded-xl border-2 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image
            src={gameImage}
            alt={gameName}
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 flex items-center justify-center gap-4">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold">
            {t('selectedGame')}
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {gameName}
          </h2>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('selectRanks')}
        </h2>
        <p className="text-muted-foreground">
          {t('selectRanksSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Mevcut Rank */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            {t('currentRank')}
          </h3>
          
          <div className="space-y-3">
            <select
              value={currentRank}
              onChange={(e) => setCurrentRank(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t('selectRank')}</option>
              {Object.keys(game === 'lol' ? 
                { 'Iron': 1, 'Bronze': 2, 'Silver': 3, 'Gold': 4, 'Platinum': 5, 'Diamond': 6, 'Master': 7, 'Grandmaster': 8, 'Challenger': 9 } :
                { 'Iron': 1, 'Bronze': 2, 'Silver': 3, 'Gold': 4, 'Platinum': 5, 'Diamond': 6, 'Ascendant': 7, 'Immortal': 8, 'Radiant': 9 }
              ).map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>

            {currentRank && currentDivisions.length > 0 && (
              <select
                value={currentDivision}
                onChange={(e) => setCurrentDivision(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('selectDivision')}</option>
                {currentDivisions.map(division => (
                  <option key={division} value={division}>
                    {game === 'lol' ? division : `Division ${division}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Hedef Rank */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {t('targetRank')}
          </h3>
          
          <div className="space-y-3">
            <select
              value={targetRank}
              onChange={(e) => setTargetRank(e.target.value)}
              disabled={!currentRank}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t('selectTargetRank')}</option>
              {availableRanks.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>

            {targetRank && targetDivisions.length > 0 && (
              <select
                value={targetDivision}
                onChange={(e) => setTargetDivision(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('selectDivision')}</option>
                {targetDivisions.map(division => (
                  <option key={division} value={division}>
                    {game === 'lol' ? division : `Division ${division}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Validation Sonucu */}
      {validation && (
        <div className="max-w-2xl mx-auto">
          {validation.valid ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✅ {t('validSelection')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300">
                        <strong>{t('price')}:</strong> ${validation.price}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300">
                        <strong>{t('duration')}:</strong> {validation.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    ❌ {t('invalidSelection')}
                  </h4>
                  <p className="text-red-700 dark:text-red-300">
                    {validation.error === 'SAME_RANK_DIVISION' && tErrors('sameRankDivision')}
                    {validation.error === 'DOWNWARD_MOVEMENT' && tErrors('downwardMovement')}
                    {validation.error === 'TOO_FAR_JUMP' && tErrors('tooFarJump')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Akıllı Öneriler */}
      {suggestions.length > 0 && !validation?.valid && (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <ArrowUp className="h-5 w-5 mr-2 text-primary" />
            {t('suggestedTargets')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => {
                  setTargetRank(suggestion.rank);
                  setTargetDivision(suggestion.division || '');
                }}
                className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">
                    {suggestion.rank} {suggestion.division}
                  </span>
                  <span className="text-sm text-primary font-semibold">
                    ${suggestion.price}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {suggestion.type === 'SAME_RANK_UP' && t('sameRankUp')}
                    {suggestion.type === 'NEXT_RANK' && t('nextRank')}
                    {suggestion.type === 'MULTI_RANK_UP' && t('multiRankUp')}
                  </span>
                  <span>{suggestion.estimatedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
