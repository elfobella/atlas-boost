# Authentication System Requirements

## 📋 İçindekiler
- [Genel Bakış](#genel-bakış)
- [Teknoloji Seçimi](#teknoloji-seçimi)
- [Kullanıcı Akışları](#kullanıcı-akışları)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Authentication Providers](#authentication-providers)
- [Session Management](#session-management)
- [Güvenlik Önlemleri](#güvenlik-önlemleri)
- [Email Verification](#email-verification)
- [Password Reset](#password-reset)
- [Protected Routes](#protected-routes)

---

## 🎯 Genel Bakış

AtlastBoost platformunda kullanıcılar:
- Email/Password ile kayıt olabilir
- Google ile hızlı giriş yapabilir
- Discord ile giriş yapabilir (gaming community için)
- Siparişlerini takip edebilir
- Profil yönetimi yapabilir

### Authentication Özellikleri
- ✅ Email/Password kayıt
- ✅ Google OAuth
- ✅ Discord OAuth
- ✅ Email verification
- ✅ Password reset
- ✅ Remember me
- ✅ Session management
- ✅ Protected routes
- ✅ Role-based access (User, Admin)

---

## 🔧 Teknoloji Seçimi

### Önerilen Stack: NextAuth.js v5 (Auth.js)

#### Neden NextAuth.js?
- ✅ Next.js 15 ile tam uyumlu
- ✅ Server Components desteği
- ✅ Multiple providers (Google, Discord, Credentials)
- ✅ JWT & Database sessions
- ✅ TypeScript desteği
- ✅ Güvenli ve test edilmiş
- ✅ Ücretsiz ve open-source

#### Alternatifler
| Teknoloji | Avantajlar | Dezavantajlar |
|-----------|-----------|---------------|
| **NextAuth.js v5** | En popüler, kolay, güvenli | - |
| Clerk | Çok kolay, modern UI | Ücretli |
| Supabase Auth | Database dahil | Vendor lock-in |
| Auth0 | Enterprise grade | Pahalı |
| Custom | Tam kontrol | Güvenlik riski, zaman |

---

## 🔑 Gerekli Kütüphaneler

### NPM Packages
```bash
# NextAuth.js v5
npm install next-auth@beta

# Database adapter (Prisma örneği)
npm install @prisma/client @auth/prisma-adapter
npm install -D prisma

# Password hashing
npm install bcryptjs
npm install -D @types/bcryptjs

# Email sending (optional)
npm install nodemailer
npm install -D @types/nodemailer
```

### Package Detayları
| Paket | Versiyon | Kullanım |
|-------|----------|----------|
| `next-auth@beta` | ^5.0.0-beta | Auth core |
| `@auth/prisma-adapter` | ^2.0.0 | Database adapter |
| `@prisma/client` | ^5.0.0 | Database ORM |
| `bcryptjs` | ^2.4.3 | Password hashing |
| `nodemailer` | ^6.9.0 | Email sending |

---

## 💾 Database Schema

### Users Table
```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?   // Null for OAuth users
  image         String?
  role          Role      @default(USER)
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
  BOOSTER
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Order {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  
  // Game info
  game                  String
  currentRank           String
  currentDivision       String?
  targetRank            String
  targetDivision        String?
  
  // Payment
  price                 Float
  currency              String   @default("USD")
  stripeSessionId       String?  @unique
  stripePaymentIntentId String?
  
  // Status
  paymentStatus         PaymentStatus @default(PENDING)
  orderStatus           OrderStatus   @default(PENDING)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  paidAt    DateTime?
  completedAt DateTime?
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

enum OrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## 🔐 NextAuth.js Configuration

### Auth.js Config
**File**: `src/lib/auth.ts`

```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
})
```

---

## 🌐 Environment Variables

### `.env.local` Güncellemesi

```env
# Existing Stripe keys...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/atlastboost

# Email (Optional - for verification)
EMAIL_SERVER=smtp://user:pass@smtp.gmail.com:587
EMAIL_FROM=noreply@atlastboost.com
```

### Secret Key Oluşturma
```bash
# NextAuth secret generate
openssl rand -base64 32
# veya
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🔌 API Endpoints

### 1. NextAuth API Route
**File**: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### 2. Register Endpoint
**File**: `src/app/api/auth/register/route.ts`

```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### 3. Current User Endpoint
**File**: `src/app/api/auth/user/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({ user: session.user });
}
```

---

## 🎨 Frontend Components

### 1. Sign In Page
**File**: `src/app/auth/signin/page.tsx`

```typescript
"use client"

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email veya şifre hatalı');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'discord') => {
    await signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
            Giriş Yap
          </h1>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthSignIn('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-md hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                {/* Google icon SVG */}
              </svg>
              <span>Google ile Giriş Yap</span>
            </button>

            <button
              onClick={() => handleOAuthSignIn('discord')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-md hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                {/* Discord icon SVG */}
              </svg>
              <span>Discord ile Giriş Yap</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">veya</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-muted-foreground">Beni hatırla</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Şifremi unuttum
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Sign Up Page
**File**: `src/app/auth/signup/page.tsx`

```typescript
"use client"

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      setLoading(false);
      return;
    }

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Kayıt başarılı ama giriş yapılamadı. Lütfen giriş yapın.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
            Kayıt Ol
          </h1>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Google ile Kayıt Ol
            </button>

            <button
              onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Discord ile Kayıt Ol
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">veya</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                İsim
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ad Soyad"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="En az 8 karakter"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Şifrenizi tekrar girin"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Kayıt yapılıyor...</span>
                </div>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. User Menu Component
**File**: `src/components/user-menu.tsx`

```typescript
"use client"

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut, Settings, Package } from 'lucide-react';

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/signin"
          className="text-sm text-foreground hover:text-primary transition-colors"
        >
          Giriş Yap
        </Link>
        <Link
          href="/auth/signup"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          Kayıt Ol
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
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
          {session.user.image ? (
            <img src={session.user.image} alt={session.user.name || ''} className="rounded-full" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
        <span className="text-sm font-medium text-foreground">
          {session.user.name || session.user.email}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 z-50 w-56 rounded-md border border-border bg-background shadow-lg">
            <div className="p-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Package className="h-4 w-4" />
                <span className="text-sm">Siparişlerim</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Ayarlar</span>
              </Link>

              <hr className="my-1 border-border" />

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent transition-colors text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### 4. Protected Route Wrapper
**File**: `src/components/protected-route.tsx`

```typescript
"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 🔒 Güvenlik Özellikleri

### 1. Password Hashing
```typescript
import bcrypt from 'bcryptjs';

// Hash password (registration)
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password (login)
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### 2. JWT Token
```typescript
// NextAuth otomatik JWT oluşturur
// Session token ile kullanıcı bilgileri güvenli
```

### 3. CSRF Protection
```typescript
// NextAuth otomatik CSRF koruması sağlar
```

### 4. Rate Limiting (Önerilen)
```typescript
// Simple rate limiting
const attempts = new Map<string, number>();

function checkRateLimit(email: string): boolean {
  const count = attempts.get(email) || 0;
  if (count > 5) {
    return false; // Too many attempts
  }
  attempts.set(email, count + 1);
  return true;
}
```

---

## 📧 Email Verification

### Implementation (Optional but Recommended)

```typescript
// Send verification email
import nodemailer from 'nodemailer';

async function sendVerificationEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Email Adresinizi Doğrulayın - AtlastBoost',
    html: `
      <h1>Email Doğrulama</h1>
      <p>Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:</p>
      <a href="${verificationUrl}">Email Doğrula</a>
    `
  });
}
```

---

## 🔄 OAuth Provider Setup

### Google OAuth Setup

1. **Google Cloud Console**: https://console.cloud.google.com
2. "Create Project" → Proje adı gir
3. "APIs & Services" → "Credentials"
4. "Create Credentials" → "OAuth 2.0 Client ID"
5. **Application type**: Web application
6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google
   ```
7. Client ID ve Secret'i kopyala → `.env.local`'e ekle

### Discord OAuth Setup

1. **Discord Developer Portal**: https://discord.com/developers/applications
2. "New Application" → Uygulama adı gir
3. "OAuth2" sekmesi
4. **Redirects**:
   ```
   http://localhost:3000/api/auth/callback/discord
   https://your-domain.com/api/auth/callback/discord
   ```
5. Client ID ve Secret'i kopyala → `.env.local`'e ekle

---

## 🛡️ Protected Routes

### Middleware Kullanımı
**File**: `src/middleware.ts`

```typescript
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/orders/:path*',
  ]
}
```

### Page Level Protection
```typescript
// src/app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return <div>Dashboard Content</div>;
}
```

---

## 📱 Session Management

### Client-Side Session
```typescript
"use client"

import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Hello {session.user.name}</div>;
}
```

### Server-Side Session
```typescript
import { auth } from '@/lib/auth';

export default async function ServerComponent() {
  const session = await auth();
  
  return <div>User: {session?.user?.email}</div>;
}
```

---

## 🎨 UI Components Checklist

### Required Components
- [ ] SignIn Page (`/auth/signin`)
- [ ] SignUp Page (`/auth/signup`)
- [ ] Forgot Password Page (`/auth/forgot-password`)
- [ ] Reset Password Page (`/auth/reset-password`)
- [ ] Verify Email Page (`/auth/verify`)
- [ ] User Menu (Navbar'da)
- [ ] Protected Route Wrapper
- [ ] Session Provider

---

## 🔐 Security Best Practices

### Password Requirements
- Minimum 8 karakter
- En az 1 büyük harf (önerilen)
- En az 1 küçük harf (önerilen)
- En az 1 rakam (önerilen)
- Özel karakter (önerilen)

### Session Security
- HttpOnly cookies
- Secure flag (production)
- SameSite: Lax
- 30 gün expiry

### API Security
- Rate limiting
- Input validation
- SQL injection prevention
- XSS prevention
- CSRF tokens (NextAuth otomatik)

---

## 🧪 Testing

### Test Users
```typescript
// Test için kullanıcı oluştur
{
  email: 'test@atlastboost.com',
  password: 'Test1234!',
  name: 'Test User'
}
```

### Test Scenarios
- [ ] Email/Password kayıt
- [ ] Email/Password giriş
- [ ] Google OAuth giriş
- [ ] Discord OAuth giriş
- [ ] Hatalı şifre
- [ ] Mevcut email ile kayıt
- [ ] Çıkış yapma
- [ ] Session persistence
- [ ] Protected route access

---

## 📊 Database Migrations

### Prisma Setup
```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Push to database
npx prisma db push

# Open Prisma Studio (DB viewer)
npx prisma studio
```

---

## 🚀 Implementation Checklist

### Hazırlık
- [ ] NextAuth.js yükle
- [ ] Prisma setup
- [ ] Database oluştur
- [ ] Environment variables ayarla

### OAuth Providers
- [ ] Google OAuth setup
- [ ] Discord OAuth setup
- [ ] Callback URLs ayarla

### Backend
- [ ] Auth config (`lib/auth.ts`)
- [ ] Prisma schema
- [ ] Register API
- [ ] NextAuth API route
- [ ] Database migrations

### Frontend
- [ ] SignIn page
- [ ] SignUp page
- [ ] User menu
- [ ] Protected routes
- [ ] Session provider
- [ ] Loading states

### Testing
- [ ] Registration test
- [ ] Login test
- [ ] OAuth test
- [ ] Logout test
- [ ] Protected route test

### Production
- [ ] Environment variables production
- [ ] OAuth production URLs
- [ ] Email verification
- [ ] Security audit

---

## 🎯 User Flow Diagrams

### Registration Flow
```
1. User → /auth/signup
2. Fill form (name, email, password)
3. POST /api/auth/register
4. User created in DB (password hashed)
5. Auto sign in
6. Redirect to /dashboard
7. (Optional) Send verification email
```

### Login Flow
```
1. User → /auth/signin
2. Enter credentials or OAuth
3. NextAuth validates
4. Session created
5. Redirect to /dashboard
```

### OAuth Flow
```
1. User clicks "Google ile Giriş"
2. Redirect to Google
3. User authorizes
4. Callback to /api/auth/callback/google
5. User created/updated in DB
6. Session created
7. Redirect to /dashboard
```

---

## 📧 Email Templates

### Welcome Email
```html
<h1>Hoş Geldiniz, {name}!</h1>
<p>AtlastBoost'a kayıt olduğunuz için teşekkürler.</p>
<p>Artık profesyonel boost hizmetlerimizden yararlanabilirsiniz.</p>
```

### Email Verification
```html
<h1>Email Adresinizi Doğrulayın</h1>
<p>Merhaba {name},</p>
<p>Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:</p>
<a href="{verificationUrl}">Email'i Doğrula</a>
```

### Password Reset
```html
<h1>Şifre Sıfırlama</h1>
<p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
<a href="{resetUrl}">Şifreyi Sıfırla</a>
<p>Bu link 1 saat geçerlidir.</p>
```

---

## 🔄 Integration with Existing Features

### Rank Selector Integration
```typescript
// Before checkout, check if user is logged in
const session = await auth();

if (!session) {
  // Redirect to signin with return URL
  router.push('/auth/signin?callbackUrl=/games/rank-selector');
  return;
}

// Use user's email for Stripe
customerEmail: session.user.email
```

### Order History
```typescript
// Dashboard'da kullanıcının siparişlerini göster
const orders = await prisma.order.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' }
});
```

---

## 🌍 Multi-Language Support

### Auth Translations
```json
// tr.json
{
  "auth": {
    "signIn": "Giriş Yap",
    "signUp": "Kayıt Ol",
    "email": "Email",
    "password": "Şifre",
    "name": "İsim",
    "confirmPassword": "Şifre Tekrar",
    "rememberMe": "Beni hatırla",
    "forgotPassword": "Şifremi unuttum",
    "signInWithGoogle": "Google ile Giriş Yap",
    "signInWithDiscord": "Discord ile Giriş Yap",
    "alreadyHaveAccount": "Zaten hesabınız var mı?",
    "dontHaveAccount": "Hesabınız yok mu?",
    "signOut": "Çıkış Yap",
    "myOrders": "Siparişlerim",
    "settings": "Ayarlar"
  }
}

// en.json
{
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    // ... translations
  }
}
```

---

## ⚡ Performance Optimization

### Session Caching
```typescript
// Next.js cache for session
export const revalidate = 0; // Always fresh
// or
export const dynamic = 'force-dynamic';
```

### Lazy Loading
```typescript
// Lazy load heavy components
const UserMenu = dynamic(() => import('@/components/user-menu'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

---

## 🎯 Role-Based Access Control

### Admin Check
```typescript
// Check if user is admin
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

// Protect admin routes
export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect('/');
  }
  
  return <div>Admin Panel</div>;
}
```

### Booster Check
```typescript
// Check if user is booster
export async function isBooster() {
  const session = await auth();
  return session?.user?.role === 'BOOSTER' || session?.user?.role === 'ADMIN';
}
```

---

## 📝 TypeScript Types

### Extended Session Type
**File**: `src/types/next-auth.d.ts`

```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install next-auth@beta @auth/prisma-adapter @prisma/client bcryptjs
npm install -D prisma @types/bcryptjs

# 2. Initialize Prisma
npx prisma init

# 3. Update schema.prisma with User models

# 4. Create migration
npx prisma migrate dev --name add_auth

# 5. Generate Prisma Client
npx prisma generate

# 6. Update environment variables

# 7. Create auth config (lib/auth.ts)

# 8. Create auth pages

# 9. Test!
npm run dev
```

---

## 📚 Additional Features (Optional)

### 1. Two-Factor Authentication (2FA)
- Google Authenticator
- SMS verification
- Backup codes

### 2. Social Logins
- Twitter/X
- Facebook
- Apple

### 3. Magic Link Login
- Passwordless login
- Email-based

### 4. Account Linking
- Link multiple OAuth accounts
- Merge accounts

---

## 🐛 Common Issues & Solutions

| Issue | Sebep | Çözüm |
|-------|-------|-------|
| "Invalid credentials" | Yanlış email/password | Kontrol et |
| "User not found" | Kayıtlı değil | Kayıt ol linki göster |
| "OAuth error" | Callback URL yanlış | Provider settings kontrol |
| "Session not found" | Session expired | Tekrar giriş yap |
| "Database error" | Prisma connection | DATABASE_URL kontrol |

---

## ✅ Launch Checklist

### Pre-Launch
- [ ] Tüm auth flows test edildi
- [ ] OAuth providers çalışıyor
- [ ] Email verification aktif
- [ ] Password reset çalışıyor
- [ ] Protected routes çalışıyor
- [ ] Session management test edildi

### Production
- [ ] Production OAuth URLs güncellendi
- [ ] NEXTAUTH_SECRET production'da farklı
- [ ] Database production'da
- [ ] Email service aktif
- [ ] SSL aktif
- [ ] Privacy policy güncellendi

---

*Bu doküman AtlastBoost platformunda authentication sistemi kurmak için gereken tüm adımları içermektedir.*
