# 🗄️ Database Migration Guide - SQLite to PostgreSQL

## Current Issue
SQLite (`dev.db`) doesn't work on Vercel's serverless environment. You need a cloud PostgreSQL database for production.

## 🎯 Recommended Solution: Railway PostgreSQL

### Step 1: Create Railway Database (5 minutes)

1. **Sign up at [Railway.app](https://railway.app)**
   - Use GitHub to sign in (easiest)
   - Free tier: $5 credit/month (enough for small apps)

2. **Create a new project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Wait for database to provision (~30 seconds)

3. **Get your DATABASE_URL**
   - Click on the PostgreSQL service
   - Go to "Connect" tab
   - Copy the "Postgres Connection URL"
   - It will look like:
     ```
     postgresql://postgres:password@host.railway.app:5432/railway
     ```

### Step 2: Add to Vercel Environment Variables

1. Go to **Vercel Dashboard**
2. Select your project (atlas-boost-qraz)
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```bash
# Required for NextAuth
AUTH_SECRET=mhQvhQPHFel5txzInoLeSVY42Fss9uHrfRsUcDCFeAc=

# Your Railway PostgreSQL URL
DATABASE_URL=postgresql://postgres:xxxxx@xxxxx.railway.app:5432/railway

# Optional: Only if you want Discord login
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

5. **Important**: Select "Production", "Preview", and "Development" for all variables
6. Click "Save"

### Step 3: Run Database Migration

After adding the DATABASE_URL to Vercel, you need to create the database tables:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations against production database
DATABASE_URL="your-railway-url" npx prisma migrate deploy
```

**Option B: Using Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your database project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

**Option C: Manual via Railway Dashboard**

1. In Railway, click your PostgreSQL service
2. Go to "Query" tab
3. You can run SQL directly, but easier to use Option A or B

### Step 4: Seed Database (Optional)

If you want to copy data from your local dev.db:

```bash
# Export data from SQLite (you'd need a custom script)
# For now, you can manually recreate test data in production

# Or use the test scripts:
DATABASE_URL="your-railway-url" node scripts/create-test-booster.js
```

### Step 5: Redeploy on Vercel

After setting environment variables:

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Click "Redeploy" button
4. Wait for deployment to complete

### Step 6: Verify Everything Works

1. **Check health endpoint**:
   ```
   https://atlas-boost-qraz.vercel.app/api/health
   ```
   Should show:
   - ✅ AUTH_SECRET: true
   - ✅ DATABASE_URL: true
   - ✅ database.connected: true

2. **Test authentication**:
   - Try signing up
   - Try signing in
   - Check if session persists

3. **Test payment flow**:
   - Select ranks
   - Go to checkout
   - Complete test payment
   - Verify order appears in dashboard

## 🔄 Alternative Database Providers

### Supabase (Free tier, more features)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy "Connection string" (use Connection Pooling URL for better performance)
5. Add to Vercel as DATABASE_URL

### Neon (Free tier, PostgreSQL serverless)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Copy connection string
4. Add to Vercel as DATABASE_URL

### PlanetScale (Free tier, MySQL-compatible)

1. Sign up at [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Update Prisma schema to use MySQL
5. Run migrations

## ⚠️ Important Notes

### Environment Variable Format

Make sure your DATABASE_URL is formatted correctly:

**PostgreSQL**:
```
postgresql://username:password@host:port/database?sslmode=require
```

**Connection Pooling (Recommended for Supabase)**:
```
postgresql://username:password@host:6543/database?pgbouncer=true
```

### Prisma Client

After changing DATABASE_URL, Prisma will automatically use PostgreSQL instead of SQLite. The schema is already compatible!

Your `schema.prisma` uses:
```prisma
provider = "postgresql"  // Already set!
```

### Local Development

Keep using SQLite locally:

**`.env.local`** (for local dev):
```bash
DATABASE_URL="file:./dev.db"
```

**Vercel** (production):
```bash
DATABASE_URL="postgresql://..."
```

## 🐛 Troubleshooting

### "Unable to open the database file"
- ✅ Fixed by using PostgreSQL instead of SQLite

### "Connection timeout"
- Check if DATABASE_URL is correct
- Ensure `?sslmode=require` is added
- Railway: Make sure database is running (check dashboard)

### "Authentication failed"
- Make sure AUTH_SECRET is set (32+ characters)
- Verify NEXTAUTH_URL matches your domain exactly

### Migrations fail
- Check database connection string
- Ensure database is empty or has compatible schema
- Try: `npx prisma migrate reset` (WARNING: deletes all data)

## 📋 Quick Checklist

- [ ] Created Railway/Supabase/Neon database
- [ ] Copied DATABASE_URL
- [ ] Added AUTH_SECRET to Vercel (use the generated one)
- [ ] Added DATABASE_URL to Vercel
- [ ] (Optional) Added DISCORD_CLIENT_ID and SECRET
- [ ] Ran `npx prisma migrate deploy` with production DATABASE_URL
- [ ] Redeployed on Vercel
- [ ] Visited `/api/health` - shows all green
- [ ] Tested signup/signin
- [ ] Tested payment flow

## 🎉 After Migration

Once everything is working:

1. Your app will work on Vercel
2. Database will persist data
3. Multiple deployments can share the same database
4. No more "Unable to open database file" errors

## 💡 Pro Tips

1. **Use connection pooling** for better performance (Supabase provides this)
2. **Set up backups** in your database provider dashboard
3. **Monitor database usage** to stay within free tier limits
4. **Keep local dev with SQLite** - faster and simpler for development

---

Need help? Check the health endpoint first: `/api/health`

