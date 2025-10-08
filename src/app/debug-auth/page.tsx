'use client'

import { useState } from 'react'

export default function DebugAuth() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  const checkEnvVars = () => {
    const vars = {
      'GOOGLE_CLIENT_ID': process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'Not set (client-side)',
      'NEXTAUTH_URL': process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set (client-side)',
    }
    setEnvVars(vars)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Auth Debug Sayfası
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Environment Variables (Client-side)
              </h2>
              <button
                onClick={checkEnvVars}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Environment Variables'ları Kontrol Et
              </button>
              
              {Object.keys(envVars).length > 0 && (
                <div className="mt-4 space-y-2">
                  {Object.entries(envVars).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                      <span className="font-mono text-sm">{key}:</span>
                      <span className="font-mono text-sm text-gray-600">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Gerekli Environment Variables
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-medium text-yellow-800 mb-2">Vercel Dashboard'da kontrol edin:</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li><code>GOOGLE_CLIENT_ID</code> - Google Cloud Console'dan alın</li>
                  <li><code>GOOGLE_CLIENT_SECRET</code> - Google Cloud Console'dan alın</li>
                  <li><code>NEXTAUTH_SECRET</code> - Güvenli bir secret key</li>
                  <li><code>NEXTAUTH_URL</code> - <code>https://atlas-boost-qraz.vercel.app</code></li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Test Links
              </h2>
              <div className="space-y-2">
                <a 
                  href="/auth/signin" 
                  className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
                >
                  Sign In Sayfası
                </a>
                <a 
                  href="/api/auth/providers" 
                  className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
                >
                  Auth Providers API
                </a>
                <a 
                  href="/api/auth/session" 
                  className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-center"
                >
                  Session API
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Google OAuth Ayarları
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-800 mb-2">Google Cloud Console'da kontrol edin:</h3>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li><strong>Authorized JavaScript origins:</strong> <code>https://atlas-boost-qraz.vercel.app</code></li>
                  <li><strong>Authorized redirect URIs:</strong> <code>https://atlas-boost-qraz.vercel.app/api/auth/callback/google</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
