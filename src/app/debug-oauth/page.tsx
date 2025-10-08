"use client"

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DebugOAuthPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OAuth Debug</h1>
        
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Environment Variables:</h2>
            <div className="space-y-1 text-sm">
              <p>GOOGLE_CLIENT_ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}</p>
              <p>NEXTAUTH_URL: {process.env.NEXT_PUBLIC_NEXTAUTH_URL || '❌ Missing'}</p>
              <p>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Session Status:</h2>
            <p>Status: {status}</p>
            {session && (
              <div className="mt-2">
                <p>User: {session.user?.name}</p>
                <p>Email: {session.user?.email}</p>
                <p>Image: {session.user?.image ? '✅' : '❌'}</p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Test Links:</h2>
            <div className="space-y-2">
              <Link 
                href="/api/auth/signin/google" 
                className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Direct Google Sign In
              </Link>
              <Link 
                href="/api/auth/signin" 
                className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                NextAuth Sign In Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
