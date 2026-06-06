# 🚀 FINAL DEPLOYMENT INSTRUCTIONS FOR RAVARI.IN

## CRITICAL: Domain Routing Issue

The domain `ravari.in` is currently configured with the old **Website Builder** platform.
To use our new React + Node.js application, follow these steps:

### STEP 1: Disable Website Builder for ravari.in

In Hostinger Dashboard:
1. Go to **Websites** 
2. Find **ravari.in**
3. Click the **three dots** (⋯) menu
4. Select **Remove from Website Builder** or **Delete**
5. Confirm removal

### STEP 2: Create Node.js Website for ravari.in

In Hostinger Dashboard:
1. Go to **Websites** → **Add Website**
2. Select **ravari.in** domain
3. Choose **Node.js** application type
4. Select **Mumbai** datacenter
5. Click **Create**
6. Wait 2-3 minutes for setup

### STEP 3: Deploy Application

Once website is created:

**Via SSH (Recommended):**
```bash
ssh u800235524@azure-lion-458034.hostingersitecom
cd ~/domains/ravari.in/public_html

# Clone repository
git clone https://github.com/harshadkhetpal/ravari-store.git .

# Setup
cd backend && npm install --production
cd ../frontend && npm install --production && npm run build

# Create .env
cat > backend/.env << 'ENVEOF'
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/ravari
JWT_SECRET=ravari_2027
CORS_ORIGIN=https://ravari.in
ADMIN_EMAIL=admin@ravari.in
ADMIN_PASSWORD=ravari@2027
ENVEOF

# Start application
cd ../backend && npm start
```

**Via Hostinger File Manager:**
1. Upload the deployment package
2. Extract archive
3. Install dependencies
4. Run start script

### STEP 4: Verify Deployment

Visit:
- https://ravari.in ✅
- https://ravari.in/shop ✅
- https://ravari.in/admin ✅
- https://ravari.in/api/products ✅

### Configuration Files Ready

The following files are in the repository:
- `backend/.env.example` - Copy and modify for your environment
- `frontend/.env.example` - Copy for production build  
- `.github/workflows/deploy.yml` - GitHub Actions auto-deploy setup
- `deploy.sh` - One-command deployment script
- `setup-deployment.sh` - Interactive configuration wizard

### IMPORTANT: After Initial Setup

**For future deployments (automatic):**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Hostinger auto-deploys in 2-3 minutes! ✅

---

**Status:** ✅ Code ready, ⏳ Domain routing needed
**Website:** https://github.com/harshadkhetpal/ravari-store
**Hosting:** Hostinger Business Plan (Node.js enabled)

