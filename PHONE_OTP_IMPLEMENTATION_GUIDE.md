# Phone OTP Authentication & User Features - Implementation Guide

This guide explains all the new features added to BeGood website.

---

## 🔐 Feature 1: Phone OTP Authentication

### How It Works:
1. User goes to checkout
2. Enters phone number (10 digits)
3. Clicks "Send OTP"
4. Receives OTP on phone via Firebase
5. Enters OTP code
6. Verified → Can complete purchase

### Firebase Setup Required:

**Step 1: Create Firebase Project**
1. Go to https://console.firebase.google.com
2. Click "Add Project"
3. Project name: `BeGood`
4. Disable Google Analytics (optional)
5. Click "Create Project"

**Step 2: Enable Phone Authentication**
1. In Firebase Console → Authentication
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Click on "Phone"
5. Click "Enable"
6. Save

**Step 3: Add Your Website to Authorized Domains**
1. In Authentication → Settings → Authorized domains
2. Add: `localhost` (for testing)
3. Add your production domain when deploying

**Step 4: Get Firebase Config**
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon (</>) to add web app
4. App nickname: `BeGood Web`
5. Copy the config object

**Step 5: Add to .env file**
Update `/app/.env` with your Firebase config:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=begood-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=begood-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=begood-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

**Step 6: Test OTP**
- Firebase gives 10 free SMS per day in test mode
- After adding billing, you get charged per SMS
- India SMS cost: ~₹0.06 per SMS

---

## 📦 Feature 2: Shipping Fees

### Configuration:
- **Shipping Fee:** ₹50 (flat rate)
- **Free Shipping:** Orders ≥ ₹500
- **Calculation:** Based on cart total

### Where It Shows:
- Checkout page (subtotal + shipping = total)
- Order confirmation page
- Admin dashboard

### Example:
- Cart: 1 A-Bar (₹120) → Shipping: ₹50 → Total: ₹170
- Cart: 5 A-Bars (₹600) → Shipping: ₹0 → Total: ₹600

---

## 👤 Feature 3: User Profile & Account

### User Data Stored:
```javascript
{
  userId: "user_9876543210",  // Based on phone
  phone: "+919876543210",
  name: "Customer Name",
  email: "customer@example.com",
  age: 25,
  addresses: [
    {
      addressId: "addr_1",
      label: "Home",
      address: "123 Main St, Apartment 4B",
      pincode: "400001",
      isDefault: true
    }
  ],
  orders: ["order-id-1", "order-id-2"],
  createdAt: "2026-01-06T..."
}
```

### Profile Page URL:
`http://localhost:3000/profile`

### What Users Can Do:
- View profile information
- Edit name, email, age
- View order history
- Manage addresses (add, edit, delete, set default)
- Logout

---

## 📍 Feature 4: Multiple Addresses

### Where to Manage:
1. **During Checkout:**
   - Select from saved addresses
   - Add new address
   - Set as default

2. **Profile Page:**
   - View all addresses
   - Add new address
   - Edit existing
   - Delete address
   - Mark as default

### Default Address:
- Auto-selected during checkout
- User can change during checkout
- Only one address can be default

---

## 📜 Feature 5: Order History

### What Users See:
- All past orders
- Order ID, date, status
- Products ordered
- Total amount paid
- Delivery address
- Payment information

### Order Status Updates:
Users see status updates:
- Pending → Processing → Shipped → Delivered

---

## 🔑 API Endpoints Added

### User Management:
- `GET /api/users/:phone` - Get user profile
- `POST /api/users/create` - Create new user
- `POST /api/users/update` - Update user profile
- `POST /api/users/address/add` - Add address
- `PUT /api/users/address/:id` - Update address
- `DELETE /api/users/address/:id` - Delete address

### Orders:
- `GET /api/users/:phone/orders` - Get user's orders

---

## 🎨 UI Components Added

### Header:
- Login/Profile button (top right)
- Shows user name when logged in
- Dropdown: Profile | Logout

### Checkout Page:
- Phone number input + OTP verification
- Address selection (if logged in)
- Add new address option
- Shipping fee calculation

### Profile Page:
- Tabs: Profile | Orders | Addresses
- Edit profile form
- Order history table
- Address management

---

## 🧪 Testing Guide

### Test Phone OTP:
1. Go to checkout with items in cart
2. Enter phone: Your real phone number
3. Click "Send OTP"
4. Enter OTP received on phone
5. Complete checkout

**Note:** Firebase requires real phone for testing in production

### Test Without Real Phone (Development):
Firebase allows test phone numbers in console:
1. Firebase Console → Authentication → Sign-in method
2. Phone → Add test phone number
3. Add: +91 1234567890 → Code: 123456
4. Use this in development

### Test Multiple Addresses:
1. Complete one order
2. Go to profile
3. Add 2-3 addresses
4. Go to checkout
5. Select different address

### Test Shipping Fee:
1. Cart with 1 A-Bar (₹120) → Check ₹50 shipping
2. Cart with 5 A-Bars (₹600) → Check ₹0 shipping

---

## 🔒 Security Features

### Phone Verification:
- Firebase handles OTP generation
- 6-digit secure code
- Expires after 2 minutes
- Rate limiting (prevent spam)

### User Data:
- Stored securely in MongoDB
- Phone number as unique ID
- No password storage (OTP only)

### Session Management:
- Firebase handles sessions
- Auto logout after 1 hour inactivity
- Secure token-based auth

---

## 📊 Admin View

### User Management:
Admins can see in MongoDB:
- All users
- User orders
- User addresses
- Registration dates

### Future Admin Features (Not Yet Implemented):
- View all users
- Search users
- View user order history
- User analytics

---

## 🚀 Deployment Notes

### Firebase in Production:
1. Update authorized domains in Firebase
2. Add production URL to Firebase console
3. Enable billing for unlimited SMS
4. Monitor usage in Firebase dashboard

### Environment Variables:
Make sure ALL Firebase variables are in Vercel:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## 💰 Cost Breakdown

### Firebase Phone Auth:
- **Test Mode:** 10 SMS/day FREE
- **Production (with billing):**
  - India SMS: ~₹0.06 per SMS
  - 1000 customers = ₹60
  - 10,000 customers = ₹600

### Recommended:
- Start with test mode
- Add billing when ready to scale
- Monitor Firebase usage dashboard

---

## 🐛 Troubleshooting

### OTP Not Received:
1. Check Firebase Console → Authentication → Users
2. Verify phone format: +91XXXXXXXXXX
3. Check Firebase quota (10/day in test mode)
4. Verify phone number is real
5. Check carrier/network issues

### Can't Login:
1. Clear browser cache
2. Check if OTP expired
3. Try resending OTP
4. Verify Firebase configuration

### Address Not Saving:
1. Check MongoDB connection
2. Verify user is logged in
3. Check browser console for errors
4. Verify API endpoint working

---

## 📱 Mobile Experience

All features are mobile-optimized:
- OTP input keyboard shows numeric
- Address forms are mobile-friendly
- Profile page responsive
- Easy navigation

---

## ✅ Implementation Checklist

Before going live:
- [ ] Set up Firebase project
- [ ] Enable phone authentication
- [ ] Add Firebase config to .env
- [ ] Test OTP on real phone
- [ ] Test guest→user flow
- [ ] Test multiple addresses
- [ ] Test shipping calculation
- [ ] Test order history
- [ ] Add billing to Firebase (production)
- [ ] Update Vercel environment variables

---

**Your website now has complete user authentication and profile management! Users can create accounts, save addresses, and view order history.** 🎉
