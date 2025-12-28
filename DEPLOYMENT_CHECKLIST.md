# TACC PMS - Production Checklist

## 🚀 Quick Deployment Steps

### 1. Database Setup
```bash
# Choose a provider (Supabase, Railway, Neon)
# Get DATABASE_URL
# Update .env with production DATABASE_URL
```

### 2. Deploy Application
```bash
# Vercel (Recommended)
vercel --prod

# Or Railway
railway up

# Or Docker
docker-compose up -d
```

### 3. Run Database Migration
```bash
npx prisma db push
```

### 4. Create Admin User
```sql
-- Run in database console
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  -- Hash password with bcrypt first
  '$2a$10$YourHashedPasswordHere',
  'Admin',
  'User',
  'ADMIN',
  NOW(),
  NOW()
);
```

### 5. Verify Deployment
- [ ] Visit application URL
- [ ] Login with admin credentials
- [ ] Test CRUD operations
- [ ] Check dashboard data
- [ ] Test password reset flow

---

## ✅ Pre-Deployment Checklist

### Code
- [ ] All features tested locally
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript errors resolved
- [ ] Linting passes (`npm run lint`)

### Environment
- [ ] Production DATABASE_URL set
- [ ] NEXT_PUBLIC_APP_URL set
- [ ] NEXTAUTH_SECRET generated
- [ ] Email credentials configured (optional)
- [ ] All secrets secured

### Database
- [ ] Production database created
- [ ] Database accessible from hosting
- [ ] Prisma schema pushed
- [ ] Connection pooling enabled
- [ ] Backups configured

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS configured
- [ ] Rate limiting considered
- [ ] Admin password strong

---

## 🔒 Security Quick Setup

### 1. Generate Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### 2. Hash Admin Password
```javascript
// Use bcrypt to hash password
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

### 3. Enable HTTPS
- Vercel: Automatic
- Railway: Automatic
- Custom: Configure SSL certificate

---

## 📊 Post-Deployment Monitoring

### Day 1
- [ ] Application loads
- [ ] Login works
- [ ] All pages accessible
- [ ] No error logs

### Week 1
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Test all features

### Month 1
- [ ] Update dependencies
- [ ] Review security
- [ ] Optimize performance
- [ ] Plan Phase 2 features

---

## 🆘 Quick Troubleshooting

### Can't Connect to Database
```bash
# Check DATABASE_URL format
# Verify database is running
# Check firewall/network settings
# Test connection: npx prisma db pull
```

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

### 500 Errors
```bash
# Check server logs
# Verify environment variables
# Check database connection
# Review recent changes
```

---

## 📞 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Railway Dashboard**: https://railway.app/dashboard
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Ready to Deploy!** 🚀
