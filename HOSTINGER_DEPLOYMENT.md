# 🌐 RAVARI STORE - HOSTINGER DEPLOYMENT GUIDE

## Prerequisites
- Hostinger Premium/Business Shared Hosting Account
- cPanel Access
- Node.js enabled on your hosting plan
- MongoDB Atlas account (cloud database) OR local MongoDB

---

## 📋 STEP 1: PREPARE HOSTINGER SERVER

### 1.1 Access cPanel
1. Log in to Hostinger
2. Go to **cPanel**
3. Look for **"Node.js"** or **"Setup Node.js App"**

### 1.2 Create Node.js Application
1. Click **"Setup Node.js App"**
2. Set **Node.js version:** 18.x or higher
3. Set **App Mode:** Production
4. Create new directory: `/home/yourusername/public_html/ravari-store`

### 1.3 Get Clone/Access Details
- Note down:
  - **App URL:** Will be provided by Hostinger
  - **Directory:** `/home/yourusername/public_html/ravari-store`
  - **Node.js Port:** Usually auto-assigned (e.g., 5000+)

---

## 📥 STEP 2: CLONE REPOSITORY TO HOSTINGER

### Using File Manager / FTP:
1. FTP into your Hostinger account
2. Navigate to `/public_html/`
3. Create folder: `ravari-store`
4. Upload all files from GitHub repo

### OR Using Terminal (SSH):
```bash
cd /home/yourusername/public_html/
git clone https://github.com/harshadkhetpal/ravari-store.git
cd ravari-store
```

---

## ⚙️ STEP 3: SETUP ENVIRONMENT FILES

### 3.1 Backend Configuration (.env)

Create `/backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB (Use MongoDB Atlas for cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ravari

# JWT Configuration
JWT_SECRET=your_secret_key_here_change_this

# File uploads
MAX_FILE_SIZE=5000000

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
```

### 3.2 Frontend Configuration (.env)

Create `/frontend/.env.production`:
```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_GA_ID=your_google_analytics_id
```

---

## 📦 STEP 4: INSTALL DEPENDENCIES

```bash
# Install backend dependencies
cd /home/yourusername/public_html/ravari-store/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🔨 STEP 5: BUILD FRONTEND

```bash
cd /home/yourusername/public_html/ravari-store/frontend
npm run build
```

This creates a `build/` folder with optimized production files.

---

## 🚀 STEP 6: START THE APPLICATION

### Option A: Using cPanel Node.js Manager
1. Go back to cPanel → Node.js
2. Select your app
3. Click **"Start"** or **"Restart"**

### Option B: Manual Start
```bash
cd /home/yourusername/public_html/ravari-store/backend
npm start
```

---

## 🌐 STEP 7: CONFIGURE REVERSE PROXY

If using cPanel Node.js, it auto-configures reverse proxy.

For manual setup, add to `.htaccess` in `/public_html/`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_HOST} ^yourdomain.com$ [OR]
  RewriteCond %{HTTP_HOST} ^www.yourdomain.com$
  RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,L]
</IfModule>
```

---

## 📊 STEP 8: DATABASE SETUP

### Using MongoDB Atlas (Recommended):
1. Go to **mongodb.com/cloud/atlas**
2. Create free account
3. Create cluster (M0 free tier)
4. Get connection string
5. Update `MONGODB_URI` in `.env`

### Using Local MongoDB:
- Contact Hostinger support to enable MongoDB
- Or use external MongoDB service

---

## ✅ STEP 9: VERIFY DEPLOYMENT

Test these URLs:

```
Frontend:     https://yourdomain.com
API Health:   https://yourdomain.com/api/health
Products:     https://yourdomain.com/api/products
Admin:        https://yourdomain.com/admin
```

---

## 🔄 STEP 10: CONTINUOUS DEPLOYMENT (Optional)

### Auto-deploy on GitHub push:

1. In Hostinger cPanel → Git:
   - Select: `https://github.com/harshadkhetpal/ravari-store.git`
   - Deploy branch: `main`
   - Auto-deploy on push: Enable (if available)

2. OR use GitHub Actions + Hostinger FTP (advanced)

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot find module"
**Solution:** Run `npm install` in both backend and frontend folders

### Problem: "Database connection failed"
**Solution:** 
- Check MongoDB Atlas credentials
- Ensure IP whitelist includes Hostinger IPs
- Verify MONGODB_URI format

### Problem: "API endpoints return 404"
**Solution:**
- Ensure backend is running
- Check reverse proxy configuration
- Verify CORS settings

### Problem: "Frontend shows blank page"
**Solution:**
- Run `npm run build` in frontend
- Check browser console for errors
- Verify REACT_APP_API_URL is correct

### View Logs:
```bash
# Backend logs
cd /home/yourusername/public_html/ravari-store/backend
tail -f logs/app.log

# Hostinger System Logs (via cPanel)
- Go to cPanel → Error Log or Raw Access Log
```

---

## 📱 HOSTINGER CONTACTS & RESOURCES

- **Support:** Hostinger Live Chat (24/7)
- **Documentation:** docs.hostinger.com
- **Node.js Guide:** docs.hostinger.com/article/node-js-applications

---

## 🔐 SECURITY CHECKLIST

- [ ] Change JWT_SECRET to unique value
- [ ] Enable MongoDB IP whitelist
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS (Hostinger auto-provides SSL)
- [ ] Enable CORS only for your domain
- [ ] Set strong admin password
- [ ] Configure environment variables securely

---

## 📞 SUPPORT

If you encounter issues:
1. Check Hostinger error logs
2. Review this guide step-by-step
3. Contact Hostinger support with error details
4. Check backend logs for API errors

**GitHub Repo:** https://github.com/harshadkhetpal/ravari-store

---

Last Updated: June 2026
