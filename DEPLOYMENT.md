# TACC PMS - Deployment Guide

## 📋 Prerequisites

### Required Software
- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn** package manager
- **Git** (for version control)

### Required Accounts (for production)
- Database hosting (e.g., Supabase, Railway, Neon)
- Application hosting (e.g., Vercel, Netlify, Railway)
- Email service (e.g., SendGrid, AWS SES) - for password reset emails

---

## 🔧 Environment Setup

### 1. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tacc?schema=public"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Authentication (add when implementing)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (for password reset)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### 2. Production Environment Variables

For production, update:

```env
DATABASE_URL="postgresql://user:pass@production-host:5432/tacc"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
NEXTAUTH_URL="https://yourdomain.com"
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### Step 1: Prepare Database
```bash
# Use a managed PostgreSQL service
# - Supabase (free tier available)
# - Railway (free tier available)
# - Neon (free tier available)
# - AWS RDS
# - DigitalOcean Managed Database
```

#### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - Go to Project Settings > Environment Variables
# - Add all variables from .env
```

#### Step 3: Run Database Migration
```bash
# After first deployment, run migration
npx prisma db push
# or
npx prisma migrate deploy
```

---

### Option 2: Railway

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Initialize Project
```bash
railway init
railway link
```

#### Step 3: Add PostgreSQL
```bash
# Add PostgreSQL service in Railway dashboard
# Copy DATABASE_URL from Railway to your environment variables
```

#### Step 4: Deploy
```bash
railway up
```

---

### Option 3: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: tacc
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: tacc
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://tacc:your_password@postgres:5432/tacc
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma db push
```

---

## 📦 Build Process

### Local Build
```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build Next.js
npm run build

# Start production server
npm start
```

### Production Build Checklist
- [ ] All environment variables set
- [ ] Database accessible from production
- [ ] Prisma Client generated
- [ ] Next.js build successful
- [ ] Database migrations applied
- [ ] SSL/TLS enabled for database connection

---

## 🗄️ Database Setup

### Initial Setup
```bash
# 1. Create database
createdb tacc

# 2. Set DATABASE_URL in .env

# 3. Push schema to database
npx prisma db push

# 4. (Optional) Seed database
npx prisma db seed
```

### Production Database
```bash
# Use managed PostgreSQL service
# Recommended providers:
# - Supabase (https://supabase.com)
# - Railway (https://railway.app)
# - Neon (https://neon.tech)
# - AWS RDS
# - DigitalOcean

# After setting up, run:
npx prisma db push
```

---

## 🔒 Security Checklist

### Before Production
- [ ] Change all default passwords
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set secure cookie settings
- [ ] Enable rate limiting
- [ ] Configure CSP headers
- [ ] Review and update permissions
- [ ] Enable database backups
- [ ] Set up monitoring

### Recommended Security Headers
Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 📊 Monitoring & Logging

### Recommended Tools
- **Application Monitoring**: Vercel Analytics, Sentry
- **Database Monitoring**: Built-in provider tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, LogRocket

### Setup Sentry (Error Tracking)
```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate Prisma Client
        run: npx prisma generate
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🧪 Pre-Deployment Testing

### Run Tests
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Database connection test
npx prisma db pull
```

### Manual Testing Checklist
- [ ] Login/logout works
- [ ] All CRUD operations work
- [ ] Permissions are enforced
- [ ] Password reset works
- [ ] Dashboard shows live data
- [ ] Forms validate correctly
- [ ] Notifications appear
- [ ] Loading states work
- [ ] Error handling works

---

## 📝 Post-Deployment

### 1. Create Admin User
```bash
# Connect to database and run:
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  '$2a$10$...',  -- Use bcrypt to hash password
  'Admin',
  'User',
  'ADMIN',
  NOW(),
  NOW()
);
```

### 2. Configure Email Service
Update forgot-password and reset-password API routes with actual email sending logic.

### 3. Set Up Backups
```bash
# Automated database backups
# Most managed services provide this
# Or use pg_dump for manual backups
pg_dump -h hostname -U username tacc > backup.sql
```

### 4. Monitor Application
- Check error logs
- Monitor response times
- Track user activity
- Review database performance

---

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check DATABASE_URL format
# Ensure database is accessible
# Verify credentials
# Check firewall rules
```

#### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

#### Prisma Client Not Found
```bash
# Regenerate Prisma Client
npx prisma generate
```

#### Migration Issues
```bash
# Use db push for existing databases
npx prisma db push

# Or reset and migrate
npx prisma migrate reset
npx prisma migrate deploy
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Review error logs
- [ ] Weekly: Check database performance
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security settings
- [ ] Quarterly: Database optimization
- [ ] Quarterly: Security audit

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update Prisma
npm install prisma@latest @prisma/client@latest
npx prisma generate
```

---

## 🎯 Performance Optimization

### Next.js Optimizations
- Enable Image Optimization
- Use Static Generation where possible
- Implement ISR (Incremental Static Regeneration)
- Enable compression
- Optimize bundle size

### Database Optimizations
- Add indexes to frequently queried columns
- Use connection pooling
- Implement caching (Redis)
- Optimize queries

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database accessible
- [ ] Security headers configured
- [ ] Error tracking set up
- [ ] Backups configured

### Deployment
- [ ] Build successful
- [ ] Database migrated
- [ ] Admin user created
- [ ] SSL/HTTPS enabled
- [ ] Domain configured

### Post-Deployment
- [ ] Application accessible
- [ ] All features working
- [ ] Monitoring active
- [ ] Backups running
- [ ] Documentation updated

---

**Deployment Guide Complete** ✅

For questions or issues, refer to:
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Vercel Docs: https://vercel.com/docs
