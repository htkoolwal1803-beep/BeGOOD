# Complete Vercel Deployment Guide with MongoDB Atlas

This guide will help you deploy your BeGood website to Vercel with cloud MongoDB.

---

## Part 1: MongoDB Atlas Setup (Free Forever)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **FREE** tier (M0 Sandbox)
4. Select **AWS** as cloud provider
5. Choose region closest to you (e.g., Mumbai for India)
6. Cluster name: `begood-cluster` (or any name)
7. Click **Create Cluster** (takes 1-3 minutes)

### Step 2: Create Database User

1. In Atlas dashboard, go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `begood_admin` (remember this)
5. Password: Click **Autogenerate Secure Password** (save this somewhere safe!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 3: Whitelist IP Addresses

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (or add `0.0.0.0/0`)
   - This is needed for Vercel to connect
   - Don't worry, your database is still secure (password protected)
4. Click **Confirm**

### Step 4: Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://begood_admin:<password>@begood-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **IMPORTANT:** Replace `<password>` with your actual password from Step 2
7. Add database name after `.net/`: 
   ```
   mongodb+srv://begood_admin:YOUR_PASSWORD@begood-cluster.xxxxx.mongodb.net/begood?retryWrites=true&w=majority
   ```

**Save this connection string! You'll need it for Vercel.**

### Step 5: Migrate Your Data (Optional)

If you have existing data in local MongoDB:

```bash
# Export from local MongoDB
mongodump --uri="mongodb://localhost:27017/begood" --out=/tmp/begood-backup

# Import to Atlas
mongorestore --uri="YOUR_ATLAS_CONNECTION_STRING" /tmp/begood-backup/begood
```

Or just let Vercel start with a fresh database (recommended for first deployment).

---

## Part 2: Vercel Deployment

### Step 1: Prepare Your Code for Deployment

1. **Create `.gitignore` file** (if not exists):
   ```bash
   cd /app
   cat > .gitignore << 'EOF'
   node_modules/
   .next/
   .env
   .env.local
   .DS_Store
   *.log
   EOF
   ```

2. **Update package.json** (check if build script exists):
   ```bash
   # Should already have these scripts:
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start"
   }
   ```

### Step 2: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   cd /app
   git init
   git add .
   git commit -m "Initial commit - BeGood e-commerce website"
   ```

2. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Repository name: `begood-website`
   - Make it **Private** (recommended)
   - Don't initialize with README (we already have code)
   - Click **Create repository**

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/begood-website.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up/Login with GitHub
   - Click **Add New Project**

2. **Import Repository:**
   - Select your `begood-website` repository
   - Click **Import**

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `next build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

4. **Add Environment Variables** (IMPORTANT!):
   Click **Environment Variables** and add ALL these:

   ```
   MONGO_URL=mongodb+srv://begood_admin:YOUR_PASSWORD@begood-cluster.xxxxx.mongodb.net/begood?retryWrites=true&w=majority
   
   NEXT_PUBLIC_BASE_URL=https://your-project-name.vercel.app
   
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_hh4y3hc
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_u6sai4l
   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=Wqh7hcto7pcOTLfPR
   
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-GYPQZXJN8E
   
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SONDA8bndxPlZ9
   RAZORPAY_KEY_SECRET=oyBvRK4HV42FO6hIw4lMMgdY
   
   ADMIN_PASSWORD=BeGood@Founder1
   ```

   **⚠️ IMPORTANT NOTES:**
   - Use your **Atlas connection string** for `MONGO_URL` (not localhost)
   - For `NEXT_PUBLIC_BASE_URL`: After first deployment, update this with your actual Vercel URL
   - You can edit these anytime in Vercel Dashboard → Settings → Environment Variables

5. **Deploy:**
   - Click **Deploy**
   - Wait 2-3 minutes
   - You'll get a URL like: `https://begood-website-xxxxx.vercel.app`

### Step 4: Update Base URL

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_BASE_URL`
3. Change to your actual Vercel URL: `https://your-project-name.vercel.app`
4. Click **Save**
5. Go to **Deployments** tab → Click **...** on latest deployment → **Redeploy**

---

## Part 3: Seed Products to Cloud Database

After deployment, seed your products to the cloud database:

```bash
# Update the seed script to use Atlas connection string
node -e "
const { MongoClient } = require('mongodb');
const MONGO_URL = 'YOUR_ATLAS_CONNECTION_STRING';
// Then run seed-products.js content
"
```

Or simply use the admin panel to add products via API (after we create the UI).

---

## Part 4: Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `begood.com`)
3. Follow DNS instructions from Vercel
4. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
5. Redeploy

---

## Part 5: Testing Your Deployment

### Test Payment Flow:
1. Visit your Vercel URL
2. Add product to cart
3. Go to checkout
4. Fill details and click "Pay with Razorpay"
5. Complete test payment (use test card: 4111 1111 1111 1111)

### Test Email:
1. Complete an order
2. Check email for order confirmation
3. If not received, check EmailJS dashboard for failed emails

### Test Analytics:
1. Visit different pages
2. Add to cart, checkout
3. Wait 24 hours
4. Check Google Analytics dashboard

### Test Admin:
1. Go to `https://your-vercel-url.vercel.app/admin`
2. Login with password: `BeGood@Founder1`
3. Check if orders appear

---

## Part 6: Continuous Deployment

**Automatic Deployments:**
- Every time you push to `main` branch on GitHub
- Vercel automatically deploys the changes
- Takes 2-3 minutes

**Manual Deploy:**
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main
# Vercel will auto-deploy
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Check if Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string has correct password
- Make sure database name is included in connection string

### Issue: "Payment not working"
**Solution:**
- Verify Razorpay keys in Vercel environment variables
- Check if keys are test or live (test for now is fine)
- Open browser console to see any errors

### Issue: "Emails not sending"
**Solution:**
- Check EmailJS dashboard for failed emails
- Verify service ID, template ID, and public key
- Make sure you haven't exceeded free tier limit

### Issue: "404 on deployed site"
**Solution:**
- Make sure all pages are in `/app/app/` directory (Next.js App Router)
- Check Vercel build logs for errors
- Verify `next build` completes successfully

---

## Monitoring Your Live Site

### Vercel Dashboard:
- **Analytics:** View page views, top pages
- **Logs:** Real-time server logs
- **Speed Insights:** Performance metrics

### MongoDB Atlas:
- **Metrics:** Database performance
- **Logs:** Query logs
- **Alerts:** Set up email alerts for issues

### Google Analytics:
- **Real-time:** See live visitors
- **Conversions:** Track purchases
- **User Flow:** See customer journey

---

## Security Checklist ✅

- [ ] `.env` file is in `.gitignore` (not committed to GitHub)
- [ ] Environment variables added to Vercel (not in code)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong admin password set
- [ ] Razorpay keys are secure (will use live keys after verification)
- [ ] HTTPS enabled (automatic with Vercel)

---

## Costs

| Service | Free Tier | What You're Using |
|---------|-----------|-------------------|
| Vercel | Unlimited bandwidth, 100 GB/month | FREE ✅ |
| MongoDB Atlas | 512 MB storage | FREE ✅ |
| EmailJS | 200 emails/month | FREE ✅ |
| Google Analytics | Unlimited | FREE ✅ |
| Razorpay | Pay per transaction | 2% + ₹2 per transaction |

**Total Monthly Cost: ₹0 + Razorpay transaction fees**

---

## Need Help?

- **Vercel Support:** https://vercel.com/support
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Vercel Discord:** Great community for help

---

**Your website will be live at:** `https://your-project-name.vercel.app` 🚀

**Remember:** After Razorpay verification, replace TEST keys with LIVE keys in Vercel environment variables!
