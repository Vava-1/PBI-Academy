# PBI Academy — Deployment Guide

## 🚀 Production Stack

| Layer | Platform | Purpose |
|-------|-----------|---------|
| Frontend | Vercel | React + Vite hosting |
| Backend API | Railway.app | Express.js API server |
| Database + Auth | Supabase | PostgreSQL + Authentication |
| DNS + CDN + Security | Cloudflare | Domain management & security |
| Payments | Flutterwave | MTN Mobile Money Rwanda |
| Email | Resend.com | Transactional emails |
| CI/CD | GitHub Actions | Automated deployment |

---

## 🌐 Cloudflare DNS Setup

After pointing nameservers to Cloudflare, add these DNS records at `dash.cloudflare.com`:

| Type  | Name | Value                              | Proxy Status |
|-------|------|------------------------------------|--------------|
| CNAME | @    | cname.vercel-dns.com               | ✅ Proxied   |
| CNAME | www  | cname.vercel-dns.com               | ✅ Proxied   |
| CNAME | api  | pbi-academy-backend.railway.app    | ✅ Proxied   |
| TXT   | @    | (Resend SPF verification record)   | ❌ DNS only  |
| MX    | @    | (Resend MX records)                | ❌ DNS only  |

### SSL Settings (Cloudflare Dashboard)
- **SSL/TLS mode**: Full (Strict)
- **Always Use HTTPS**: ON
- **HSTS**: ON (include subdomains, 6 months)
- **Minimum TLS**: 1.2
- **Auto Minify**: JS ✅ CSS ✅ HTML ✅
- **Brotli**: ON
- **Security Level**: High
- **Bot Fight Mode**: ON
- **Web Application Firewall (WAF)**: ON

---

## 🔧 GitHub Secrets Configuration

Go to: GitHub Repo → Settings → Secrets and variables → Actions

### Required Secrets:

| Secret Name | Where to get it | Purpose |
|-------------|------------------|---------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens | Vercel deployment |
| `VERCEL_ORG_ID` | vercel.com → Settings → General | Vercel organization |
| `VERCEL_PROJECT_ID` | Vercel project → Settings | Vercel project |
| `RAILWAY_TOKEN` | railway.app → Account → Tokens | Railway deployment |
| `SUPABASE_URL` | Supabase project → Settings → API | Database URL |
| `SUPABASE_ANON_KEY` | Supabase project → Settings → API | Public API key |
| `API_URL` | Railway deployment URL | Backend API endpoint |
| `FLUTTERWAVE_PUBLIC_KEY` | Flutterwave dashboard | Payment processing |

---

## 📋 Deployment Order

### 1. Supabase Setup (First)
```bash
# Create new Supabase project
# Run migrations: supabase db push
# Run seed: supabase db seed
# Copy URL and keys to GitHub secrets
```

### 2. Backend Deployment (Railway)
```bash
# Push to GitHub → Railway auto-deploys
# Add environment variables in Railway dashboard
# Note the production URL
```

### 3. Frontend Deployment (Vercel)
```bash
# Push to GitHub → Vercel auto-deploys
# Add environment variables in Vercel dashboard
# Add custom domain: pbiacademy.com
```

### 4. Cloudflare DNS Configuration
```bash
# Point nameservers to Cloudflare
# Add DNS records (see table above)
# Configure SSL and security settings
```

### 5. Payment & Email Setup
```bash
# Flutterwave: Create account → get keys → add webhook URL
# Resend: Verify domain → add DNS records
# Test payment flow end-to-end
```

---

## 🧪 Testing Checklist

### Pre-Deployment Tests:
- [ ] Frontend builds locally: `cd app && npm run build`
- [ ] Backend builds locally: `cd server && npm run build`
- [ ] All environment variables documented
- [ ] Git repository clean and committed

### Post-Deployment Tests:
- [ ] Website loads at `https://pbiacademy.com`
- [ ] API health check: `https://api.pbiacademy.com/health`
- [ ] User registration works
- [ ] Email verification received
- [ ] Course enrollment works
- [ ] Payment flow completes (Flutterwave)
- [ ] Admin panel accessible
- [ ] SSL certificate valid
- [ ] Mobile responsive design
- [ ] Performance scores acceptable (>90)

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow automatically:
1. **Runs tests** on every push/PR
2. **Scans for vulnerabilities** using Trivy
3. **Deploys frontend** to Vercel (main branch only)
4. **Deploys backend** to Railway (main branch only)
5. **Updates environment variables** from secrets

---

## 📊 Monitoring & Logging

### Frontend (Vercel):
- Real-time logs: `vercel logs`
- Analytics: Vercel Analytics dashboard
- Performance: Vercel Speed Insights

### Backend (Railway):
- Application logs: Railway Logs tab
- Metrics: Railway Metrics dashboard
- Health checks: `/health` endpoint monitored

### Database (Supabase):
- Query performance: Supabase Dashboard
- Auth logs: Supabase Auth tab
- Storage usage: Supabase Storage tab

---

## 🚨 Rollback Procedures

### Frontend Rollback:
```bash
# Vercel automatically keeps previous deployments
# Go to Vercel dashboard → Deployments → Promote previous
```

### Backend Rollback:
```bash
# Railway maintains deployment history
# Railway dashboard → Deployments → Rollback
```

### Database Rollback:
```bash
# Supabase point-in-time recovery
# Or restore from backup: supabase db restore
```

---

## 📞 Support Contacts

- **Vercel Support**: support@vercel.com
- **Railway Support**: support@railway.app
- **Supabase Support**: support@supabase.com
- **Flutterwave Support**: support@flutterwave.com
- **Resend Support**: support@resend.com
- **Cloudflare Support**: support@cloudflare.com

---

## 🎯 Success Metrics

Track these KPIs post-deployment:
- **Uptime**: >99.9%
- **Page load time**: <2 seconds
- **API response time**: <500ms
- **Error rate**: <1%
- **User registration conversion**: >15%
- **Payment success rate**: >95%
- **Email deliverability**: >98%

---

## 🔄 Maintenance Schedule

- **Daily**: Monitor logs and performance
- **Weekly**: Update dependencies, check security
- **Monthly**: Database optimization, backup verification
- **Quarterly**: Performance audit, security review

---

## 📝 Notes

- All environment variables are stored securely in GitHub Secrets
- Database connections use connection pooling
- API rate limiting implemented
- Security headers configured
- CDN caching enabled for static assets
- Automated backups configured (daily)
- SSL certificates auto-renewed
- Payment webhooks verified
