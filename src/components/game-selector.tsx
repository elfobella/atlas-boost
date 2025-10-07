"use client"

import Image from "next/image";
import { useTranslations } from 'next-intl';
import { GAME_INFO } from "@/lib/rank-utils";

interface GameSelectorProps {
  selectedGame: 'lol' | 'valorant' | null;
  onGameSelect: (game: 'lol' | 'valorant') => void;
}

export function GameSelector({ selectedGame, onGameSelect }: GameSelectorProps) {
  const t = useTranslations('rankSelector');
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('selectGame')}
        </h2>
        <p className="text-muted-foreground">
          {t('selectGameSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-md mx-auto">
        {/* League of Legends */}
        <div
          onClick={() => onGameSelect('lol')}
          className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 h-64 ${
            selectedGame === 'lol'
              ? 'scale-105 shadow-2xl ring-4 ring-primary'
              : 'hover:scale-[1.02] hover:shadow-xl'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-110">
            <Image
              src="/images/LoL.jpeg"
              alt="League of Legends"
              fill
              className="object-contain"
            />
            <div className={`absolute inset-0 transition-all duration-300 ${
              selectedGame === 'lol'
                ? 'bg-primary/30'
                : 'bg-black/20 group-hover:bg-black/10'
            }`} />
          </div>

          {/* Selected Indicators */}
          {selectedGame === 'lol' && (
            <>
              {/* Badge */}
              <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-pulse">
                ✓ {t('selected')}
              </div>
              {/* Bottom Label */}
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-primary text-primary-foreground py-3 text-center font-bold text-lg">
                LEAGUE OF LEGENDS
              </div>
            </>
          )}
          {/* Hover Label */}
          {!selectedGame && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 text-white py-3 text-center font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              LEAGUE OF LEGENDS
            </div>
          )}
        </div>

        {/* Valorant */}
        <div
          onClick={() => onGameSelect('valorant')}
          className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 h-64 ${
            selectedGame === 'valorant'
              ? 'scale-105 shadow-2xl ring-4 ring-primary'
              : 'hover:scale-[1.02] hover:shadow-xl'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-110">
            <Image
              src="/images/Valorant.jpeg"
              alt="Valorant"
              fill
              className="object-contain"
            />
            <div className={`absolute inset-0 transition-all duration-300 ${
              selectedGame === 'valorant'
                ? 'bg-primary/30'
                : 'bg-black/20 group-hover:bg-black/10'
            }`} />
          </div>

          {/* Selected Indicators */}
          {selectedGame === 'valorant' && (
            <>
              {/* Badge */}
              <div className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-pulse">
                ✓ {t('selected')}
              </div>
              {/* Bottom Label */}
              <div className="absolute bottom-0 left-0 right-0 z-10 bg-primary text-primary-foreground py-3 text-center font-bold text-lg">
                VALORANT
              </div>
            </>
          )}
          {/* Hover Label */}
          {!selectedGame && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 text-white py-3 text-center font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              VALORANT
            </div>
          )}
        </div>
      </div>

      {selectedGame && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">
              {GAME_INFO[selectedGame].icon} {GAME_INFO[selectedGame].name} seçildi
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
