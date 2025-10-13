"use client"

import Link from 'next/link';
import { Check } from 'lucide-react';

export default function PricingPage() {

  const games = [
    {
      name: 'League of Legends',
      href: '/games/rank-selector?game=lol',
      features: [
        'All ranks available',
        'Duo/Solo boost options',
        'Live chat with booster',
        'Guaranteed LP gains',
        'VPN protection'
      ],
      priceRange: '$5 - $100'
    },
    {
      name: 'Valorant',
      href: '/games/rank-selector?game=valorant',
      features: [
        'Iron to Radiant',
        'Placement matches',
        'Duo queue available',
        'Role selection',
        'Rank retention guarantee'
      ],
      priceRange: '$5 - $150'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your game and see instant pricing based on your current rank and desired rank
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {games.map((game) => (
            <div
              key={game.name}
              className="bg-card border border-border rounded-lg p-8 hover:border-primary/50 transition-all"
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">{game.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-primary">{game.priceRange}</span>
                <span className="text-muted-foreground"> per rank</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {game.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={game.href}
                className="block w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors text-center font-medium"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-muted/50 rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            All Boost Orders Include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Most orders completed within 2-6 days</p>
              </div>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Professional Boosters</h3>
                <p className="text-sm text-muted-foreground">High-rank players with proven track records</p>
              </div>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Secure & Safe</h3>
                <p className="text-sm text-muted-foreground">VPN protection and confidential service</p>
              </div>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">Live chat support whenever you need help</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Not sure which option to choose? Use our rank selector to get an exact quote
          </p>
          <Link
            href="/games/rank-selector"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Calculate My Price
          </Link>
        </div>
      </div>
    </div>
  );
}

