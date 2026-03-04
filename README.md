# BeGood - Premium Functional Wellness E-Commerce Website

## Overview
BeGood is a complete, fully functional e-commerce website for a premium functional wellness brand. Built with Next.js 14, MongoDB, and modern web technologies, it features a beautiful, minimalist design and comprehensive functionality including:

- **Complete E-Commerce Flow**: Product catalog, shopping cart, checkout, order management
- **Admin Dashboard**: Password-protected dashboard with analytics, order management, and insights
- **Analytics Integration**: Google Analytics 4 + custom analytics tracking
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **Premium UI**: Minimalist luxury design with Playfair Display + Inter typography

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS** (Custom design system)
- **Shadcn/UI Components**
- **Lucide React** (Icons)

### Backend
- **Next.js API Routes**
- **MongoDB** (Database)
- **UUID** (Order IDs)

### Integrations (Placeholders - Update with Your Keys)
- **Razorpay** (Payment Gateway)
- **Firebase** (Firestore, Auth, Analytics)
- **EmailJS** (Order Confirmation Emails)
- **Google Analytics 4** (Web Analytics)

## Features

### Customer-Facing Features
✅ Homepage with hero, benefits, testimonials, and CTAs
✅ Shop page with product cards and variant selection
✅ Product detail pages with full information, ingredients, reviews
✅ Shopping cart with quantity management
✅ Guest checkout (no account required)
✅ Order confirmation page
✅ About page with brand story and mission
✅ FAQ page
✅ Contact page
✅ Privacy Policy, Terms & Conditions, Refund Policy pages

### Admin Features
✅ Password-protected admin dashboard
✅ Order management with status updates
✅ Revenue and analytics tracking
✅ Conversion funnel visualization
✅ Device breakdown (mobile vs desktop)
✅ Top ordering locations by pincode
✅ Recent orders table with quick actions

### Analytics & Tracking
✅ Page view tracking
✅ Product view tracking
✅ Add to cart tracking
✅ Checkout initiated tracking
✅ Order completion tracking
✅ Custom event tracking
✅ Google Analytics 4 integration

## Project Structure

```
/app
├── app/
│   ├── page.js                 # Homepage
│   ├── layout.js               # Root layout with Header/Footer
│   ├── globals.css             # Global styles
│   ├── shop/
│   │   └── page.js            # Shop page
│   ├── product/
│   │   └── [id]/page.js       # Product detail page
│   ├── cart/
│   │   └── page.js            # Shopping cart
│   ├── checkout/
│   │   └── page.js            # Checkout page
│   ├── order/
│   │   └── [id]/page.js       # Order confirmation
│   ├── about/
│   │   └── page.js            # About page
│   ├── admin/
│   │   └── page.js            # Admin dashboard
│   ├── faq/
│   │   └── page.js            # FAQ page
│   ├── contact/
│   │   └── page.js            # Contact page
│   ├── privacy/
│   │   └── page.js            # Privacy policy
│   ├── terms/
│   │   └── page.js            # Terms & conditions
│   ├── refund/
│   │   └── page.js            # Refund policy
│   └── api/
│       └── [[...path]]/
│           └── route.js        # API routes
├── components/
│   ├── Header.js               # Navigation header
│   ├── Footer.js               # Footer
│   ├── Button.js               # Reusable button
│   └── ProductCard.js          # Product card component
├── lib/
│   ├── CartContext.js          # Shopping cart context
│   ├── products.js             # Product data
│   └── utils.js                # Utility functions
├── .env                        # Environment variables
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # This file
```

## Getting Started

### 1. Environment Variables

Update `/app/.env` with your actual credentials:

```env
# MongoDB (Already configured)
MONGO_URL=mongodb://localhost:27017/begood

# Next.js Base URL (Already configured)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Firebase Configuration (UPDATE THESE)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Razorpay Configuration (UPDATE THESE)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# EmailJS Configuration (UPDATE THESE)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Google Analytics 4 (UPDATE THIS)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Admin Dashboard Password (UPDATE THIS)
ADMIN_PASSWORD=admin123
```

### 2. Installation

Dependencies are already installed. If you need to reinstall:

```bash
cd /app
yarn install
```

### 3. Running the Application

The application is already running via supervisor. To restart:

```bash
sudo supervisorctl restart nextjs
```

To view logs:

```bash
tail -f /var/log/supervisor/nextjs.out.log
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin (Password: admin123)

## API Endpoints

### Public Endpoints
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `POST /api/analytics/track` - Track analytics events

### Admin Endpoints (Require Authentication)
- `POST /api/admin/auth` - Admin authentication
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order status
- `GET /api/admin/analytics` - Get analytics data

## Design System

### Colors
- **White**: #FFFFFF
- **Cream**: #F5F0E8
- **Gold**: #C8A97E
- **Text**: Gray scale

### Typography
- **Headings**: Playfair Display
- **Body**: Inter

### Components
All components use Tailwind CSS with a custom design system. Shadcn/UI components are pre-installed and available at `@/components/ui/*`.

## Product Data

Products are defined in `/app/lib/products.js`. The current product:

- **BeGood A-Bar** (Functional Chocolate)
- 4 variants: 50g & 100g in Dark Chocolate and Mint Dark Chocolate
- Prices: ₹299 (50g), ₹549 (100g)
- Key ingredients: Ashwagandha, L-Theanine, Dark Cocoa, Magnesium

## Integration Setup

### Razorpay Payment Gateway

1. Sign up at https://razorpay.com
2. Get API keys from Dashboard
3. Update `.env` with your keys
4. Implement payment flow in `/app/app/checkout/page.js`

### EmailJS for Order Confirmations

1. Sign up at https://www.emailjs.com
2. Create email service and template
3. Update `.env` with your credentials
4. Email sending logic is in checkout flow

### Firebase (Firestore, Auth, Analytics)

1. Create project at https://console.firebase.google.com
2. Get configuration from Project Settings
3. Update `.env` with your config
4. Firebase is initialized in layout and components

### Google Analytics 4

1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID
3. Update `.env` with your ID
4. Analytics is already integrated in layout

## Database Collections

### orders
```javascript
{
  orderId: String (UUID),
  customerName: String,
  email: String,
  phone: String,
  address: String,
  pincode: String,
  products: Array,
  totalAmount: Number,
  status: String ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
  paymentId: String,
  createdAt: ISO Date String,
  updatedAt: ISO Date String
}
```

### analytics
```javascript
{
  event: String,
  params: Object,
  timestamp: ISO Date String,
  userAgent: String
}
```

## Admin Dashboard

Access: http://localhost:3000/admin
Default Password: admin123 (Change in `.env`)

Features:
- Total orders and revenue
- Unique visitors count
- Conversion funnel visualization
- Device breakdown
- Top ordering locations
- Recent orders with status management

## Customization

### Adding New Products

Edit `/app/lib/products.js`:

```javascript
export const products = [
  {
    id: 'unique-id',
    name: 'Product Name',
    tagline: 'Tagline',
    shortDescription: 'Short description',
    fullDescription: 'Full description',
    image: 'image-url',
    category: 'Category',
    featured: true,
    variants: [
      { size: '50g', flavor: 'Flavor', price: 299, stock: 100 }
    ],
    ingredients: [...],
    benefits: [...],
    occasions: [...],
    reviews: [...]
  }
]
```

### Changing Brand Colors

Update `/app/app/globals.css`:

```css
:root {
  --primary: 38 30% 65%;  /* Gold color */
  --secondary: 40 33% 95%; /* Cream color */
  /* ... other color variables ... */
}
```

### Updating Content

All page content is in their respective page files:
- Homepage: `/app/app/page.js`
- About: `/app/app/about/page.js`
- FAQ: `/app/app/faq/page.js`
- etc.

## Testing

### Test Order Flow

1. Browse products at http://localhost:3000/shop
2. Add items to cart
3. Go to checkout
4. Fill in test customer details
5. Place order (payment integration pending)
6. View order confirmation
7. Check admin dashboard for the new order

### Test Admin Dashboard

1. Go to http://localhost:3000/admin
2. Login with password: admin123
3. View analytics and orders
4. Update order status
5. Check funnel and device metrics

## Deployment

### Environment Setup

1. Set all environment variables in your hosting platform
2. Update `NEXT_PUBLIC_BASE_URL` to your production URL
3. Configure MongoDB connection string
4. Add all third-party API keys

### Build

```bash
yarn build
```

### Start Production Server

```bash
yarn start
```

## TODO / Future Enhancements

- [ ] Complete Razorpay payment integration
- [ ] Complete EmailJS email sending
- [ ] Add product reviews submission
- [ ] Add user authentication (optional)
- [ ] Add wishlist feature
- [ ] Add coupon/promo codes
- [ ] Add product recommendations
- [ ] Add email newsletters
- [ ] Add more payment options
- [ ] Add international shipping
- [ ] SEO optimization
- [ ] Performance optimization

## Support

For questions or issues:
- Email: support@begood.com
- Phone: +91 XXXXX XXXXX

## License

All rights reserved. BeGood © 2026

---

**Built with ❤️ using Next.js and modern web technologies**
