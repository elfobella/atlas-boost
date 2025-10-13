"use client"

import { useTranslations } from 'next-intl';
import { Gamepad2, Sword, Target, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function GamesPage() {
  const t = useTranslations('games');

  const games = [
    {
      id: 'lol',
      name: 'League of Legends',
      icon: '/images/lol-icon.png',
      image: '/images/LoL.jpeg',
      description: 'En popüler MOBA oyunu için profesyonel boost hizmeti',
      features: ['Rank Boost', 'Duo Queue', 'Coaching'],
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'valorant',
      name: 'Valorant',
      icon: '/images/valorant-icon.jpg',
      image: '/images/Valorant.jpeg',
      description: 'Taktiksel FPS oyunu için uzman boost hizmeti',
      features: ['Rank Boost', 'Unrated Boost', 'Placement Matches'],
      color: 'from-red-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {games.map((game) => (
            <div key={game.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-r ${game.color} p-6 text-white`}>
                <div className="flex items-center mb-4">
                  <Image
                    src={game.icon}
                    alt={game.name}
                    width={48}
                    height={48}
                    className="rounded-lg mr-4"
                  />
                  <div>
                    <h3 className="text-2xl font-bold">{game.name}</h3>
                    <p className="text-white/80">{game.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="space-y-3 mb-6">
                  {game.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Zap className="h-4 w-4 text-primary mr-2" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link
                  href={`/games/rank-selector?game=${game.id}`}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-center block"
                >
                  {t('startBoost')} {game.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            {t('whyChooseUs')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('feature1Title')}
              </h3>
              <p className="text-muted-foreground">
                {t('feature1Description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sword className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('feature2Title')}
              </h3>
              <p className="text-muted-foreground">
                {t('feature2Description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('feature3Title')}
              </h3>
              <p className="text-muted-foreground">
                {t('feature3Description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
