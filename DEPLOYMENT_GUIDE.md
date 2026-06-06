# 🚀 RAVARI STORE - COMPLETE DEPLOYMENT GUIDE

**Repository:** https://github.com/harshadkhetpal/ravari-store
**Status:** ✅ Production Ready
**Version:** 1.0.0

---

## 📋 TABLE OF CONTENTS

1. [Quick Start (3 minutes)](#quick-start)
2. [Deployment Methods](#deployment-methods)
3. [Setup Instructions](#setup-instructions)
4. [GitHub Actions (Auto-Deploy)](#github-actions)
5. [Manual Deployment](#manual-deployment)
6. [Verification & Testing](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Maintenance](#monitoring)

---

## ⚡ QUICK START

```bash
# 1. Run the setup wizard (interactive)
./setup-deployment.sh

# Follow prompts to configure:
# - Hostinger credentials
# - Domain name (ravari.in)
# - MongoDB connection
# - Admin credentials

# 2. Push to GitHub (auto-deploys)
git add .
git commit -m "Deploy to production"
git push origin main

# 3. Verify at https://ravari.in
```

**That's it! ✅**

---

## 🚀 DEPLOYMENT METHODS

### Method 1: GitHub Actions (Automatic) ⭐ RECOMMENDED
- **Trigger:** Automatic on every push to `main` branch
- **Speed:** Deploys in ~2-3 minutes
- **Effort:** Just push to GitHub
- **Setup:** 5 minutes

### Method 2: Manual Script (One Command)
- **Trigger:** Run `./deploy.sh` anytime
- **Speed:** Deploys in ~5 minutes
- **Effort:** Single command
- **Setup:** Configure `.env` files

### Method 3: Direct SSH (Advanced)
- **Trigger:** SSH into Hostinger manually
- **Speed:** Immediate
- **Effort:** Multiple SSH commands
- **Setup:** SSH access required

---

## 📝 SETUP INSTRUCTIONS

### STEP 1: Create Configuration Files

**Interactive Setup (Recommended):**
```bash
./setup-deployment.sh
```

**Manual Setup:**
1. Copy `backend/.env.example` to `backend/.env`
2. Copy `frontend/.env.example` to `frontend/.env.production`
3. Edit both files with your configuration

**Required Configuration:**

`backend/.env`:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ravari
JWT_SECRET=your_random_secret_key
CORS_ORIGIN=https://ravari.in
ADMIN_EMAIL=admin@ravari.in
ADMIN_PASSWORD=strong_password_here
```

`frontend/.env.production`:
```env
REACT_APP_API_URL=https://ravari.in/api
REACT_APP_GA_ID=your_google_analytics_id
```

### STEP 2: Prepare Hostinger

1. **Log into Hostinger Dashboard**
2. **Enable Node.js:**
   - Go to: Websites → Your Domain → Settings
   - Enable: Node.js support
   - Version: 18.x or higher

3. **Create Directory:**
   - Via SSH: `mkdir -p ~/public_html/ravari-store`
   - Via File Manager: Create folder `/public_html/ravari-store`

4. **Set Up SSL:**
   - Go to: Websites → SSL
   - Click: "Install" for ravari.in
   - Wait for completion (usually instant)

### STEP 3: Setup MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create M0 free cluster
4. Create database user
5. Get connection string
6. Whitelist Hostinger IPs:
   - In MongoDB Atlas → Network Access
   - Add IP: 0.0.0.0/0 (or specific Hostinger IP)
7. Copy connection string to `backend/.env`

**Option B: Hostinger MongoDB**
- Contact Hostinger support to enable local MongoDB
- Connect via: `mongodb://localhost:27017/ravari`

### STEP 4: Prepare Repository for GitHub Actions

Only needed for automatic deployments:

1. Go to: https://github.com/harshadkhetpal/ravari-store/settings/secrets/actions
2. Click: "New repository secret"
3. Add each secret:

| Name | Value |
|------|-------|
| `HOSTINGER_USER` | Your Hostinger username |
| `HOSTINGER_HOST` | Your Hostinger host (e.g., user.hostingersitecom) |
| `HOSTINGER_PASSWORD` | Your Hostinger password |

---

## 🔄 GITHUB ACTIONS (AUTOMATIC DEPLOYMENT)

### How It Works

1. **You push to GitHub:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions automatically:**
   - ✅ Builds the frontend
   - ✅ Installs dependencies
   - ✅ Tests the application
   - ✅ Deploys to Hostinger
   - ✅ Restarts the application

3. **Live in ~2-3 minutes**

### Monitor Deployment

Go to: https://github.com/harshadkhetpal/ravari-store/actions

- Click the latest workflow run
- View logs in real-time
- See deployment status

### Disable Auto-Deploy (Optional)

To deploy manually instead:
1. Go to: Settings → Actions → General
2. Disable: "Allow GitHub Actions to create and approve pull requests"

---

## 🔧 MANUAL DEPLOYMENT

### One-Command Deployment

```bash
export HOSTINGER_USER=your_username
export HOSTINGER_HOST=your_host.hostingersitecom
export HOSTINGER_PASSWORD=your_password
./deploy.sh
```

**What it does:**
1. ✅ Builds frontend (npm run build)
2. ✅ Installs backend dependencies
3. ✅ Connects to Hostinger via SSH
4. ✅ Clones/updates repository
5. ✅ Restarts Node.js application
6. ✅ Verifies deployment

### Step-by-Step Manual Deployment

**On Your Local Machine:**
```bash
# Build frontend
cd frontend
npm install --production
npm run build
cd ..

# Prepare backend
cd backend
npm install --production
cd ..
```

**On Hostinger (via SSH):**
```bash
# Connect
ssh your_username@your_host.hostingersitecom

# Navigate to app directory
cd public_html/ravari-store

# Clone or update code
git clone https://github.com/harshadkhetpal/ravari-store.git . 
# OR if already cloned:
git pull origin main

# Install dependencies
cd backend && npm install --production && cd ..
cd frontend && npm install --production && npm run build && cd ..

# Restart via cPanel Node.js Manager
# OR use pm2:
pm2 restart ravari-store

# Verify
curl http://localhost:5000/api/health
```

---

## ✅ VERIFICATION & TESTING

### Test URLs

After deployment, verify these endpoints:

```bash
# Frontend
https://ravari.in

# API Health Check
https://ravari.in/api/health

# Products API
https://ravari.in/api/products

# Admin Panel
https://ravari.in/admin
```

### Manual Testing Commands

```bash
# Test API
curl -X GET https://ravari.in/api/products | jq '.'

# Test products list
curl -X GET https://ravari.in/api/products?limit=10 | jq '.'

# Test health endpoint
curl -X GET https://ravari.in/api/health | jq '.'

# View SSL certificate
echo | openssl s_client -servername ravari.in -connect ravari.in:443 2>/dev/null | openssl x509 -noout -dates
```

### Browser Testing

1. Open: https://ravari.in
2. Check console (F12) for errors
3. Test features:
   - Browse products
   - Add to cart
   - View product details
   - Test search
   - Check images load

---

## 🐛 TROUBLESHOOTING

### Issue: "Site not updating"
**Solutions:**
- Hard refresh browser: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- Wait 5 minutes for deployment to complete
- Check GitHub Actions logs: Settings → Actions
- Clear Cloudflare cache if using CDN

### Issue: "API returns 404"
**Solutions:**
- Verify backend is running: `curl https://ravari.in/api/health`
- Check `.htaccess` reverse proxy configuration
- Verify `backend/.env` PORT setting
- View logs: `ssh your_host` → `tail -f logs/app.log`

### Issue: "Database connection failed"
**Solutions:**
- Verify `MONGODB_URI` in `backend/.env`
- Check MongoDB Atlas IP whitelist
- Test connection locally: `mongosh "mongodb+srv://..."`
- Verify database user has correct permissions

### Issue: "Cannot find module"
**Solutions:**
- Install dependencies: `npm install` in both backend and frontend
- Delete `node_modules` and reinstall
- Clear npm cache: `npm cache clean --force`

### Issue: "Frontend shows blank page"
**Solutions:**
- Check browser console (F12) for errors
- Verify `REACT_APP_API_URL` in `frontend/.env.production`
- Run `npm run build` in frontend directory
- Check that frontend files exist: `/public_html/ravari-store/frontend/build/`

### Issue: "Port already in use"
**Solutions:**
- Change PORT in `backend/.env`
- Or kill process: `pkill -f "node server.js"`
- Check process: `lsof -i :5000`

### View Application Logs

**SSH into Hostinger:**
```bash
ssh your_username@your_host.hostingersitecom

# Backend logs
cd ~/public_html/ravari-store/backend
tail -f logs/app.log

# Or via cPanel
# Go to: cPanel → Error Log or Raw Access Log
```

---

## 📊 MONITORING & MAINTENANCE

### Regular Maintenance

**Daily:**
- Monitor error logs for issues
- Check application status
- Monitor database performance

**Weekly:**
- Review GitHub Actions logs
- Check SSL certificate validity
- Monitor uptime

**Monthly:**
- Review analytics
- Update dependencies
- Backup database

### Enable Uptime Monitoring

**Option 1: Uptime Robot (Free)**
1. Go to: https://uptimerobot.com
2. Create monitor for: https://ravari.in/api/health
3. Set check interval: Every 5 minutes

**Option 2: Hostinger Monitoring**
- Go to: Hostinger Dashboard → Monitoring
- Enable email alerts

### Database Backups

**MongoDB Atlas Backups:**
1. Go to: Cluster → Backup
2. Enable: Automatic Backups
3. Set retention: 30 days

**Manual Backup:**
```bash
# Export data
mongoexport --uri="mongodb+srv://user:pass@cluster.mongodb.net/ravari" \
  --collection=products --out=products_backup.json
```

---

## 📈 ENVIRONMENT VARIABLES REFERENCE

### Backend (.env)

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `production` | Environment mode |
| `MONGODB_URI` | `mongodb+srv://...` | Database connection |
| `JWT_SECRET` | `random_key_123` | Session secret |
| `CORS_ORIGIN` | `https://ravari.in` | Allowed origins |
| `ADMIN_EMAIL` | `admin@ravari.in` | Admin account |
| `ADMIN_PASSWORD` | `strong_pwd` | Admin password |

### Frontend (.env.production)

| Variable | Example | Purpose |
|----------|---------|---------|
| `REACT_APP_API_URL` | `https://ravari.in/api` | API endpoint |
| `REACT_APP_GA_ID` | `G-XXXXX` | Google Analytics |

---

## 🔐 SECURITY CHECKLIST

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ chars)
- [ ] Enable MongoDB IP whitelist
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (SSL enabled)
- [ ] Configure CORS properly
- [ ] Disable debug mode
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Monitor error logs

---

## 📞 SUPPORT & RESOURCES

**Deployment Issues:**
- GitHub Actions logs: Settings → Actions
- Hostinger support: 24/7 live chat
- Server logs: SSH into host → `tail -f logs/app.log`

**Documentation:**
- Hostinger docs: https://docs.hostinger.com
- Node.js guide: https://nodejs.org/docs
- MongoDB: https://docs.mongodb.com
- React: https://react.dev

**GitHub Repository:**
- https://github.com/harshadkhetpal/ravari-store
- Issues: https://github.com/harshadkhetpal/ravari-store/issues

---

## 🎉 DEPLOYMENT SUCCESS CHECKLIST

- [ ] Configuration files created
- [ ] MongoDB Atlas set up
- [ ] GitHub Secrets added
- [ ] First deployment completed
- [ ] Website loads at https://ravari.in
- [ ] API responds at https://ravari.in/api/health
- [ ] Admin works at https://ravari.in/admin
- [ ] SSL certificate valid
- [ ] Logs are accessible
- [ ] Monitoring enabled

---

**Last Updated:** June 2026
**Status:** Production Ready ✅
**Support:** GitHub Issues or Hostinger Support

