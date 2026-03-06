# BeGood Third-Party Integration Setup Guide

This guide will help you set up all the third-party services needed for your BeGood e-commerce website to work in production.

## 🔐 Required Integrations

### 1. Razorpay (Payment Gateway) - REQUIRED

**What it does:** Handles all payment processing for customer orders

**Setup Steps:**
1. Go to https://razorpay.com and create an account
2. Complete KYC verification (required for live mode)
3. Once verified, go to Dashboard → Settings → API Keys
4. Generate Live API keys (NOT test keys)
5. You'll get:
   - Key ID (starts with `rzp_live_`)
   - Key Secret (keep this secret!)

**Add to `.env` file:**
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Important Notes:**
- Test keys start with `rzp_test_` - DO NOT use these in production
- Keep your Key Secret private and never commit it to GitHub
- The website will use real payment processing once you add these keys

---

### 2. EmailJS (Order Confirmation Emails) - REQUIRED

**What it does:** Sends automatic order confirmation emails to customers

**Setup Steps:**
1. Go to https://www.emailjs.com and create a free account
2. Add an Email Service:
   - Go to Email Services → Add New Service
   - Choose your email provider (Gmail recommended)
   - Connect your email account
   - Note the Service ID (e.g., `service_xxxxxx`)

3. Create an Email Template:
   - Go to Email Templates → Create New Template
   - Use this template structure:
   
   **Subject:** Order Confirmation - BeGood Order #{{order_id}}
   
   **Content:**
   ```
   Hi {{customer_name}},

   Thank you for your order!

   Order ID: {{order_id}}
   Total Amount: ₹{{total_amount}}

   Order Details:
   {{order_details}}

   Delivery Address:
   {{address}}
   {{pincode}}

   We'll send you a tracking number once your order ships (usually within 2-3 business days).

   Questions? Reply to this email or contact us at support@begood.com

   Best regards,
   BeGood Team
   ```
   
   - Note the Template ID (e.g., `template_xxxxxx`)

4. Get your Public Key:
   - Go to Account → General
   - Copy your Public Key

**Add to `.env` file:**
```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_YOUR_SERVICE_ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_YOUR_TEMPLATE_ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
```

**Important Notes:**
- Free plan allows 200 emails/month (upgrade if you need more)
- Test your template before going live
- Make sure your Gmail allows "Less secure app access" if using Gmail

---

### 3. Google Analytics 4 (Website Analytics) - OPTIONAL

**What it does:** Tracks website visitors, page views, conversions, and user behavior

**Setup Steps:**
1. Go to https://analytics.google.com
2. Create a new GA4 Property
3. Set up a Data Stream for your website
4. Copy the Measurement ID (starts with `G-`)

**Add to `.env` file:**
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**What's Already Tracked:**
- Page views
- Product views
- Add to cart
- Checkout initiated
- Purchase completions
- Drop-off points

**How to View Data:**
After adding your Measurement ID:
1. Go to Google Analytics dashboard
2. Wait 24-48 hours for data to start appearing
3. View reports under:
   - Reports → Life Cycle → Acquisition (where users come from)
   - Reports → Life Cycle → Engagement (what users do)
   - Reports → Life Cycle → Monetization (purchases)
   - Reports → User → Demographics (who your users are)

---

### 4. Firebase (Optional - Future Use)

**What it does:** Can be used for additional features like push notifications, advanced analytics

**Current Status:** Placeholder values in `.env` - not actively used yet

**If you want to set it up:**
1. Go to https://console.firebase.google.com
2. Create a new project
3. Go to Project Settings → General
4. Copy the Firebase configuration
5. Update the values in `.env`

**Note:** This is optional and not required for the website to work.

---

## 🚀 After Adding Your Keys

### Step 1: Update the .env file
Edit `/app/.env` and replace all placeholder values with your actual keys.

### Step 2: Restart the application
```bash
sudo supervisorctl restart nextjs
```

### Step 3: Test the integrations

**Test Payment:**
1. Go to http://localhost:3000/shop
2. Add A-Bar to cart
3. Go to checkout
4. Fill in details
5. Click "Place Order"
6. Razorpay payment window should appear
7. Complete test payment

**Test Email:**
- After successful order, check customer email
- Should receive order confirmation within 1-2 minutes

**Test Analytics:**
- Visit different pages on your site
- Add products to cart
- Check Google Analytics after 24 hours

---

## 🔒 Security Best Practices

1. **Never commit .env file to GitHub**
   - It's already in .gitignore
   - If you accidentally commit it, regenerate all keys immediately

2. **Use environment variables in production**
   - When deploying (Vercel, AWS, etc.), add these as environment variables in your hosting dashboard
   - Don't hardcode them in your code

3. **Keep Key Secret values private**
   - Only `NEXT_PUBLIC_*` variables are exposed to frontend
   - Other values are server-side only

4. **Regular key rotation**
   - Rotate your Razorpay and EmailJS keys every 3-6 months
   - Update in `.env` and restart the application

---

## 📊 Monitoring Your Integrations

### Razorpay Dashboard
- View all transactions
- Check failed payments
- Generate reports
- Manage refunds
- Dashboard: https://dashboard.razorpay.com

### EmailJS Dashboard  
- Monitor email delivery
- Check email quota usage
- View failed emails
- Dashboard: https://dashboard.emailjs.com

### Google Analytics
- View real-time users
- Track conversions
- Analyze user behavior
- Dashboard: https://analytics.google.com

---

## ❓ Troubleshooting

### Payment not working?
- Check if Razorpay keys are correct
- Verify KYC is completed
- Ensure you're using LIVE keys (rzp_live_), not test keys
- Check Razorpay dashboard for any issues with your account

### Emails not sending?
- Verify EmailJS Service ID, Template ID, and Public Key
- Check EmailJS dashboard for failed emails
- Ensure you haven't exceeded free tier limit (200 emails/month)
- Check spam folder

### Analytics not showing data?
- Wait 24-48 hours after adding Measurement ID
- Check if Measurement ID is correct (starts with G-)
- Verify website is receiving traffic
- Check Google Analytics Real-Time report

---

## 💰 Pricing Summary

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Razorpay | 2% + ₹2 per transaction | Volume discounts available |
| EmailJS | 200 emails/month | From $10/month for 1000 emails |
| Google Analytics | Completely free | Free forever |
| Firebase | Generous free tier | Pay as you go |

---

## 📞 Support Contacts

- **Razorpay:** https://razorpay.com/support/
- **EmailJS:** support@emailjs.com
- **Google Analytics:** https://support.google.com/analytics

---

**Last Updated:** January 2026

**Need Help?** If you're stuck with any integration, please check the official documentation of each service or contact their support teams.
