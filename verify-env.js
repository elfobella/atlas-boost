#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Run this to check which environment variables are set correctly
 */

const requiredVars = {
  // Critical for auth
  AUTH_SECRET: 'Required for NextAuth to work (32+ characters)',
  NEXTAUTH_URL: 'Your production URL (e.g., https://atlas-boost-qraz.vercel.app)',
  
  // Database
  DATABASE_URL: 'PostgreSQL connection string (not SQLite for production)',
  
  // Stripe
  STRIPE_SECRET_KEY: 'Stripe secret key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook secret (for /api/webhooks/stripe)',
  
  // OAuth (at least one required)
  GOOGLE_CLIENT_ID: 'Google OAuth client ID',
  GOOGLE_CLIENT_SECRET: 'Google OAuth client secret',
  DISCORD_CLIENT_ID: 'Discord OAuth client ID (optional)',
  DISCORD_CLIENT_SECRET: 'Discord OAuth client secret (optional)',
  
  // Pusher (for notifications)
  PUSHER_APP_ID: 'Pusher app ID',
  PUSHER_SECRET: 'Pusher secret',
  NEXT_PUBLIC_PUSHER_KEY: 'Pusher key (public)',
  NEXT_PUBLIC_PUSHER_CLUSTER: 'Pusher cluster (e.g., eu)',
};

console.log('\n🔍 Environment Variables Check\n');
console.log('=' .repeat(60));

let allGood = true;
let missingCritical = [];
let missingOptional = [];

for (const [key, description] of Object.entries(requiredVars)) {
  const value = process.env[key];
  const isSet = !!value;
  const icon = isSet ? '✅' : '❌';
  
  // Determine if critical or optional
  const isCritical = [
    'AUTH_SECRET',
    'NEXTAUTH_URL', 
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'GOOGLE_CLIENT_ID'
  ].includes(key);
  
  console.log(`${icon} ${key}`);
  console.log(`   ${description}`);
  
  if (!isSet) {
    if (isCritical) {
      missingCritical.push(key);
      allGood = false;
    } else {
      missingOptional.push(key);
    }
  } else if (key === 'DATABASE_URL' && value.includes('file:')) {
    console.log('   ⚠️  WARNING: Using SQLite (file:) - this won\'t work in production!');
    console.log('   You need PostgreSQL for Vercel deployment.');
    allGood = false;
  } else if (key === 'AUTH_SECRET' && value.length < 32) {
    console.log(`   ⚠️  WARNING: AUTH_SECRET is too short (${value.length} chars, need 32+)`);
    allGood = false;
  }
  
  console.log('');
}

console.log('=' .repeat(60));

if (allGood && missingOptional.length === 0) {
  console.log('\n✅ All environment variables are set correctly!\n');
} else {
  if (missingCritical.length > 0) {
    console.log('\n❌ Missing CRITICAL variables:');
    missingCritical.forEach(v => console.log(`   - ${v}`));
  }
  
  if (missingOptional.length > 0) {
    console.log('\n⚠️  Missing OPTIONAL variables:');
    missingOptional.forEach(v => console.log(`   - ${v}`));
  }
  
  console.log('\n📚 See DATABASE_MIGRATION_GUIDE.md for setup instructions\n');
}

// Quick tips
console.log('\n💡 Quick fixes:');
console.log('   Generate AUTH_SECRET: openssl rand -base64 32');
console.log('   Check health endpoint: /api/health');
console.log('   Read guide: DATABASE_MIGRATION_GUIDE.md\n');

