import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { cartHasHamper } from '@/lib/products'
import { sendEmail, layout, siteUrl, siteLink } from '@/lib/email'
import { TEMPLATE_KEYS, DEFAULT_TEMPLATES, mergeTemplate, fillTemplate, bodyToHtml } from '@/lib/emailTemplates'
import { feedbackToReview, hasAdverseReport } from '@/lib/feedbackToReview'

/**
 * Admin API guard.
 *
 * The admin pages ask for a password, but until now that check lived only in
 * the browser - every /api/admin/* route answered anyone who asked, exposing
 * the full customer list (names, phones, emails, addresses) to the open
 * internet. The password is now required on the server as well.
 */
function requireAdmin(request) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const provided = request.headers.get('x-admin-key') || ''
  return provided === expected
}

function adminDenied() {
  return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
}

// Razorpay webhook signature verification
function verifyRazorpaySignature(body, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

// MongoDB connection
let cachedClient = null
let cachedDb = null

async function connectToDatabase() {
  // Clear cache if connection is stale or errored
  if (cachedClient) {
    try {
      // Test if the connection is still valid
      await cachedDb.command({ ping: 1 })
      return { client: cachedClient, db: cachedDb }
    } catch (e) {
      // Connection is stale, clear cache
      cachedClient = null
      cachedDb = null
    }
  }

  const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI
  const client = await MongoClient.connect(mongoUrl)

  const db = client.db()
  cachedClient = client
  cachedDb = db

  return { client, db }
}

// Pincode validation using India Post API
async function validatePincode(pincode) {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await response.json()
    
    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const postOffice = data[0].PostOffice[0]
      return {
        valid: true,
        city: postOffice.District || postOffice.Division,
        state: postOffice.State,
        country: postOffice.Country
      }
    }
    return { valid: false, message: 'Invalid pincode' }
  } catch (error) {
    console.error('Pincode validation error:', error)
    return { valid: false, message: 'Unable to validate pincode' }
  }
}

// Helper to extract path segments
function getPathSegments(pathname) {
  return pathname.replace('/api/', '').split('/').filter(Boolean)
}

export async function GET(request) {
  const pathname = request.nextUrl.pathname
  const segments = getPathSegments(pathname)

    // Every admin route requires the admin password, except the login check.
    if (segments[0] === 'admin' && segments[1] !== 'auth' && !requireAdmin(request)) {
      return adminDenied()
    }

  try {
    // GET /api/products
    if (segments[0] === 'products' && segments.length === 1) {
      // In a real app, this would come from database
      // For now, using static product data from lib/products.js
      return NextResponse.json({
        success: true,
        message: 'Use client-side products from lib/products.js'
      })
    }

    // GET /api/orders/:id
    if (segments[0] === 'orders' && segments.length === 2) {
      const { db } = await connectToDatabase()
      const order = await db.collection('orders').findOne({ orderId: segments[1] })
      
      if (!order) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, order })
    }

    // GET /api/admin/orders
    if (segments[0] === 'admin' && segments[1] === 'orders') {
      const { db } = await connectToDatabase()
      const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      
      return NextResponse.json({ success: true, orders })
    }

    // GET /api/admin/kpis - the numbers that actually decide whether the
    // business works: conversion, repeat purchase, AOV and the second-purchase
    // window. Deliberately cohort-aware so a festival spike cannot hide a
    // falling repeat rate.
    if (segments[0] === 'admin' && segments[1] === 'kpis') {
      const { db } = await connectToDatabase()

      const orders = await db.collection('orders').find({}).sort({ createdAt: 1 }).toArray()
      const events = await db.collection('analytics').find({}).sort({ timestamp: -1 }).limit(20000).toArray()

      const paidOrders = orders.filter((o) => o.status !== 'Cancelled')
      const totalOrders = paidOrders.length
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      const aov = totalOrders ? Math.round(totalRevenue / totalOrders) : 0

      // Group orders by customer (last 10 digits of the phone).
      const byCustomer = {}
      for (const o of paidOrders) {
        const key = String(o.phone || '').replace(/\D/g, '').slice(-10)
        if (!key) continue
        ;(byCustomer[key] = byCustomer[key] || []).push(o)
      }
      const customers = Object.values(byCustomer)
      const totalCustomers = customers.length
      const repeatCustomers = customers.filter((list) => list.length > 1).length
      const repeatPurchaseRate = totalCustomers
        ? Math.round((repeatCustomers / totalCustomers) * 1000) / 10
        : 0

      // Days between first and second order, for customers who came back.
      const gaps = customers
        .filter((list) => list.length > 1)
        .map((list) => {
          const sorted = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          return (new Date(sorted[1].createdAt) - new Date(sorted[0].createdAt)) / 86400000
        })
        .filter((d) => Number.isFinite(d) && d >= 0)
      const medianSecondPurchaseDays = gaps.length
        ? Math.round(gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)])
        : null
      const repeatWithin90 = gaps.filter((d) => d <= 90).length
      const repeatWithin90Pct = gaps.length
        ? Math.round((repeatWithin90 / gaps.length) * 1000) / 10
        : 0

      // Funnel. Unique visitors is approximated from analytics events; treat it
      // as a trend line rather than an exact count.
      const pageViews = events.filter((e) => e.event === 'page_view').length
      const addToCart = events.filter((e) => e.event === 'add_to_cart').length
      const uniqueVisitors = new Set(events.map((e) => e.userAgent)).size
      const conversionRate = uniqueVisitors
        ? Math.round((totalOrders / uniqueVisitors) * 1000) / 10
        : 0
      const cartAbandonment = addToCart
        ? Math.round((1 - totalOrders / addToCart) * 1000) / 10
        : 0

      // Delivery threshold performance - are bundles doing their job?
      const ordersAbove600 = paidOrders.filter((o) => (o.subtotal || 0) >= 600).length
      const ordersAbove249 = paidOrders.filter((o) => (o.subtotal || 0) >= 249).length

      // Monthly cohorts: first-time buyers per month and how many returned.
      const cohorts = {}
      for (const list of customers) {
        const sorted = [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        const first = new Date(sorted[0].createdAt)
        if (Number.isNaN(first.getTime())) continue
        const key = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}`
        cohorts[key] = cohorts[key] || { month: key, newCustomers: 0, returned: 0, revenue: 0 }
        cohorts[key].newCustomers += 1
        if (sorted.length > 1) cohorts[key].returned += 1
        cohorts[key].revenue += sorted.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      }
      const cohortList = Object.values(cohorts)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((c) => ({
          ...c,
          revenue: Math.round(c.revenue),
          repeatRate: c.newCustomers ? Math.round((c.returned / c.newCustomers) * 1000) / 10 : 0
        }))

      // Reviews collected through the site.
      const reviewCount = await db.collection('reviews').countDocuments({}).catch(() => 0)
      const feedbackCount = await db.collection('feedback_submissions').countDocuments({}).catch(() => 0)

      return NextResponse.json({
        success: true,
        kpis: {
          revenue: { total: Math.round(totalRevenue), aov },
          orders: { total: totalOrders, above249: ordersAbove249, above600: ordersAbove600 },
          customers: { total: totalCustomers, repeat: repeatCustomers, repeatPurchaseRate },
          retention: { medianSecondPurchaseDays, repeatWithin90Pct },
          funnel: { uniqueVisitors, pageViews, addToCart, orders: totalOrders, conversionRate, cartAbandonment },
          reviews: { collected: reviewCount + feedbackCount },
          cohorts: cohortList
        }
      })
    }

    // GET /api/admin/analytics
    if (segments[0] === 'admin' && segments[1] === 'analytics') {
      const { db } = await connectToDatabase()
      
      // Get orders for revenue calculation (limit to recent 1000)
      const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(1000).toArray()
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      
      // Get analytics events (limit to recent 5000)
      const events = await db.collection('analytics').find({}).sort({ timestamp: -1 }).limit(5000).toArray()
      
      // Calculate funnel metrics
      const pageViews = events.filter(e => e.event === 'page_view').length
      const addToCartEvents = events.filter(e => e.event === 'add_to_cart').length
      const checkoutEvents = events.filter(e => e.event === 'checkout_initiated').length
      const completedOrders = orders.length
      
      // Get unique visitors (simplified - based on userAgent)
      const uniqueVisitors = new Set(events.map(e => e.userAgent)).size
      
      // Get device breakdown
      const mobileEvents = events.filter(e => e.userAgent && e.userAgent.includes('Mobile')).length
      const desktopEvents = events.length - mobileEvents
      
      // Get top locations (by pincode from orders)
      const locationCounts = {}
      orders.forEach(order => {
        if (order.pincode) {
          locationCounts[order.pincode] = (locationCounts[order.pincode] || 0) + 1
        }
      })
      const topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([pincode, count]) => ({ pincode, orders: count }))
      
      return NextResponse.json({
        success: true,
        analytics: {
          totalOrders: orders.length,
          totalRevenue,
          uniqueVisitors,
          funnel: {
            pageViews,
            addToCart: addToCartEvents,
            checkout: checkoutEvents,
            completed: completedOrders
          },
          devices: {
            mobile: mobileEvents,
            desktop: desktopEvents
          },
          topLocations
        }
      })
    }

    // GET /api/admin/reviews - Get all reviews
    if (segments[0] === 'admin' && segments[1] === 'reviews') {
      const { db } = await connectToDatabase()
      const reviews = await db.collection('reviews').find({}).sort({ date: -1 }).limit(200).toArray()
      
      return NextResponse.json({ success: true, reviews })
    }

    // GET /api/admin/email-templates - current wording, defaults merged with edits
    if (segments[0] === 'admin' && segments[1] === 'email-templates') {
      const { db } = await connectToDatabase()
      const saved = await db.collection('email_templates').find({}).toArray()
      const byKey = Object.fromEntries(saved.map((t) => [t.key, t]))

      return NextResponse.json({
        success: true,
        templates: TEMPLATE_KEYS.map((k) => ({
          ...mergeTemplate(k, byKey[k]),
          isEdited: !!byKey[k]
        }))
      })
    }

    // GET /api/admin/notifications - Get all notification signups
    if (segments[0] === 'admin' && segments[1] === 'notifications') {
      const { db } = await connectToDatabase()
      const notifications = await db.collection('notifications').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      
      return NextResponse.json({ success: true, notifications })
    }

    // GET /api/admin/users - Get all users
    if (segments[0] === 'admin' && segments[1] === 'users') {
      const { db } = await connectToDatabase()
      const users = await db.collection('users').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      
      return NextResponse.json({ success: true, users })
    }

    // GET /api/admin/subscriptions - Get all subscriptions
    if (segments[0] === 'admin' && segments[1] === 'subscriptions') {
      const { db } = await connectToDatabase()
      const subscriptions = await db.collection('subscriptions').find({}).sort({ createdAt: -1 }).limit(500).toArray()
      
      // Check for upcoming deliveries (within next 7 days)
      const now = new Date()
      const upcomingDeliveries = []
      
      subscriptions.forEach(sub => {
        if (sub.status === 'active' && sub.deliverySchedule) {
          sub.deliverySchedule.forEach(delivery => {
            if (delivery.status === 'scheduled' || delivery.status === 'processing') {
              const deliveryDate = new Date(delivery.scheduledDate)
              const daysUntilDelivery = Math.ceil((deliveryDate - now) / (1000 * 60 * 60 * 24))
              if (daysUntilDelivery <= 7 && daysUntilDelivery >= 0) {
                upcomingDeliveries.push({
                  subscriptionId: sub.subscriptionId,
                  customerName: sub.customerName,
                  phone: sub.phone,
                  address: sub.address,
                  month: delivery.month,
                  barsCount: delivery.barsCount,
                  scheduledDate: delivery.scheduledDate,
                  daysUntilDelivery
                })
              }
            }
          })
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        subscriptions,
        upcomingDeliveries: upcomingDeliveries.sort((a, b) => a.daysUntilDelivery - b.daysUntilDelivery)
      })
    }

    // GET /api/admin/affiliates - Get all affiliates
    if (segments[0] === 'admin' && segments[1] === 'affiliates' && segments.length === 2) {
      const { db } = await connectToDatabase()
      const affiliates = await db.collection('affiliates').find({}).sort({ createdAt: -1 }).toArray()
      
      // Get order stats for each affiliate
      const affiliatesWithStats = await Promise.all(affiliates.map(async (affiliate) => {
        const orders = await db.collection('orders').find({ affiliateCode: affiliate.code }).toArray()
        const totalOrders = orders.length
        const totalUnits = orders.reduce((sum, order) => {
          return sum + (order.products?.reduce((pSum, p) => pSum + (p.quantity || 0), 0) || 0)
        }, 0)
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        
        return {
          ...affiliate,
          stats: {
            totalOrders,
            totalUnits,
            totalRevenue,
            clicks: affiliate.clicks || 0
          }
        }
      }))
      
      return NextResponse.json({ success: true, affiliates: affiliatesWithStats })
    }

    // GET /api/admin/affiliates/:code - Get single affiliate details
    if (segments[0] === 'admin' && segments[1] === 'affiliates' && segments.length === 3) {
      const { db } = await connectToDatabase()
      const code = segments[2].toUpperCase()
      
      const affiliate = await db.collection('affiliates').findOne({ code })
      if (!affiliate) {
        return NextResponse.json({ success: false, message: 'Affiliate not found' }, { status: 404 })
      }
      
      // Get orders for this affiliate
      const orders = await db.collection('orders').find({ affiliateCode: code }).sort({ createdAt: -1 }).toArray()
      
      const totalOrders = orders.length
      const totalUnits = orders.reduce((sum, order) => {
        return sum + (order.products?.reduce((pSum, p) => pSum + (p.quantity || 0), 0) || 0)
      }, 0)
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      return NextResponse.json({ 
        success: true, 
        affiliate: {
          ...affiliate,
          stats: { totalOrders, totalUnits, totalRevenue, clicks: affiliate.clicks || 0 }
        },
        orders
      })
    }

    // GET /api/affiliate/stats/:code - Get affiliate stats (for affiliate dashboard)
    if (segments[0] === 'affiliate' && segments[1] === 'stats' && segments.length === 3) {
      const { db } = await connectToDatabase()
      const code = segments[2].toUpperCase()
      
      const affiliate = await db.collection('affiliates').findOne({ code, isActive: true })
      if (!affiliate) {
        return NextResponse.json({ success: false, message: 'Affiliate not found or inactive' }, { status: 404 })
      }
      
      // Get orders for this affiliate (limited info for affiliate view)
      const orders = await db.collection('orders').find({ affiliateCode: code }).sort({ createdAt: -1 }).toArray()
      
      const totalOrders = orders.length
      const totalUnits = orders.reduce((sum, order) => {
        return sum + (order.products?.reduce((pSum, p) => pSum + (p.quantity || 0), 0) || 0)
      }, 0)
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      // Return limited order info for affiliate
      const ordersSummary = orders.map(order => ({
        orderId: order.orderId,
        date: order.createdAt,
        units: order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0,
        amount: order.totalAmount,
        pincode: order.pincode,
        status: order.status
      }))
      
      return NextResponse.json({ 
        success: true, 
        affiliate: {
          name: affiliate.name,
          code: affiliate.code,
          isActive: affiliate.isActive
        },
        stats: { totalOrders, totalUnits, totalRevenue, clicks: affiliate.clicks || 0 },
        orders: ordersSummary
      })
    }

    // GET /api/users/:phone - Get user by phone number
    if (segments[0] === 'users' && segments.length === 2) {
      const { db } = await connectToDatabase()
      const phone = decodeURIComponent(segments[1])
      const user = await db.collection('users').findOne({ phone })
      
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, user })
    }

    // GET /api/review/:token - load a review request for the public form.
    // The token is the auth: no login, because forcing one here would gut the
    // response rate the same way it hurts checkout.
    if (segments[0] === 'review' && segments.length === 2) {
      const { db } = await connectToDatabase()
      const rr = await db.collection('review_requests').findOne({ token: segments[1] })

      if (!rr) {
        return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        request: {
          productIds: rr.productIds || [],
          customerName: rr.customerName || '',
          submitted: !!rr.submittedAt,
          couponCode: rr.couponCode || null
        }
      })
    }

    // GET /api/products/:id/reviews - approved reviews written by customers
    if (segments[0] === 'products' && segments.length === 3 && segments[2] === 'reviews') {
      const { db } = await connectToDatabase()
      const reviews = await db
        .collection('reviews')
        .find({ productId: segments[1], approved: { $ne: false } })
        .sort({ date: -1 })
        .limit(100)
        .toArray()

      // Feedback submissions the admin has chosen to show publicly.
      const published = await db
        .collection('feedback_submissions')
        .find({ productId: segments[1], publishedAsReview: true })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()

      const fromFeedback = published.map(feedbackToReview).filter(Boolean)

      return NextResponse.json({
        success: true,
        reviews: [
          ...reviews.map((r) => ({
            name: r.name,
            role: r.role || 'Verified buyer',
            rating: r.rating,
            comment: r.comment,
            date: r.date,
            incentivised: !!r.incentivised
          })),
          ...fromFeedback
        ]
      })
    }

    // GET /api/customers/:phone/first-order - has this number ordered before?
    // Used to decide the free-delivery threshold. Checked on the server so the
    // discount cannot be claimed by editing localStorage.
    if (segments[0] === 'customers' && segments.length === 3 && segments[2] === 'first-order') {
      const { db } = await connectToDatabase()
      const raw = decodeURIComponent(segments[1] || '')
      const digits = raw.replace(/\D/g, '').slice(-10)

      if (digits.length !== 10) {
        return NextResponse.json({ success: false, isFirstOrder: false, error: 'Invalid phone' }, { status: 400 })
      }

      // Numbers are stored in a few shapes (+91XXXXXXXXXX, 91XXXXXXXXXX, bare).
      const priorOrder = await db.collection('orders').findOne({
        phone: { $regex: digits + '$' }
      })

      return NextResponse.json({ success: true, isFirstOrder: !priorOrder })
    }

    // GET /api/users/:phone/orders - Get user's order history
    if (segments[0] === 'users' && segments.length === 3 && segments[2] === 'orders') {
      const { db } = await connectToDatabase()
      const phone = decodeURIComponent(segments[1])
      
      // Find orders by phone number
      const orders = await db.collection('orders').find({ phone }).sort({ createdAt: -1 }).toArray()
      
      return NextResponse.json({ success: true, orders })
    }

    // GET /api/users/:phone/addresses - Get user's saved addresses
    if (segments[0] === 'users' && segments.length === 3 && segments[2] === 'addresses') {
      const { db } = await connectToDatabase()
      const phone = decodeURIComponent(segments[1])
      
      const user = await db.collection('users').findOne({ phone })
      
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, addresses: user.addresses || [] })
    }

    // GET /api/products - Get all products
    if (segments[0] === 'products' && segments.length === 1) {
      const { db } = await connectToDatabase()
      const products = await db.collection('products').find({}).toArray()
      
      return NextResponse.json({ success: true, products })
    }

    // GET /api/products/:id - Get single product
    if (segments[0] === 'products' && segments.length === 2) {
      const { db } = await connectToDatabase()
      const product = await db.collection('products').findOne({ id: segments[1] })
      
      if (!product) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, product })
    }

    // GET /api/pincode/:pincode - Validate pincode and get city/state
    if (segments[0] === 'pincode' && segments.length === 2) {
      const pincode = segments[1]
      
      if (!/^\d{6}$/.test(pincode)) {
        return NextResponse.json({ success: false, message: 'Pincode must be 6 digits' }, { status: 400 })
      }
      
      const result = await validatePincode(pincode)
      
      if (result.valid) {
        return NextResponse.json({ 
          success: true, 
          city: result.city,
          state: result.state,
          country: result.country
        })
      } else {
        return NextResponse.json({ success: false, message: result.message }, { status: 400 })
      }
    }

    // GET /api/admin/coupons - Get all coupons with usage stats
    if (segments[0] === 'admin' && segments[1] === 'coupons' && segments.length === 2) {
      const { db } = await connectToDatabase()
      const coupons = await db.collection('coupons').find({}).sort({ createdAt: -1 }).toArray()
      
      return NextResponse.json({ success: true, coupons })
    }

    // GET /api/admin/coupons/:id/usage - Get detailed usage for a coupon
    if (segments[0] === 'admin' && segments[1] === 'coupons' && segments.length === 4 && segments[3] === 'usage') {
      const { db } = await connectToDatabase()
      const couponId = segments[2]
      
      const usage = await db.collection('coupon_usage').find({ couponId }).sort({ usedAt: -1 }).toArray()
      
      return NextResponse.json({ success: true, usage })
    }

    // GET /api/feedback/questions - Get active feedback questions for a product
    if (segments[0] === 'feedback' && segments[1] === 'questions' && segments.length === 2) {
      const { db } = await connectToDatabase()
      const { searchParams } = new URL(request.url)
      const productId = searchParams.get('productId')

      if (!productId) {
        return NextResponse.json({ success: false, message: 'productId is required' }, { status: 400 })
      }

      const form = await db.collection('feedback_questions').findOne({ active: true, productId })

      return NextResponse.json({
        success: true,
        productId,
        configured: !!form,
        questions: form?.questions || [],
        title: form?.title || 'Share your feedback',
        description: form?.description || '',
        updatedAt: form?.updatedAt || null
      })
    }

    // GET /api/admin/feedback/questions/all - List all product questionnaires (admin)
    if (segments[0] === 'admin' && segments[1] === 'feedback' && segments[2] === 'questions' && segments[3] === 'all') {
      const { db } = await connectToDatabase()

      const forms = await db.collection('feedback_questions')
        .find({ active: true })
        .project({ productId: 1, productName: 1, questions: 1, title: 1, updatedAt: 1 })
        .toArray()

      return NextResponse.json({ success: true, forms })
    }

    // GET /api/feedback/forms/configured - which products accept feedback.
    // The customer profile page used to call the admin endpoint for this, which
    // stopped working once admin routes required a password. This exposes only
    // the product ids, never the questions or anyone's answers.
    if (segments[0] === 'feedback' && segments[1] === 'forms' && segments[2] === 'configured') {
      const { db } = await connectToDatabase()
      const forms = await db.collection('feedback_questions').find({ active: true }).toArray()
      return NextResponse.json({
        success: true,
        productIds: [...new Set(forms.map((f) => f.productId).filter(Boolean))]
      })
    }

    // GET /api/feedback/product/:productId - Get feedback for a specific product
    if (segments[0] === 'feedback' && segments[1] === 'product' && segments.length === 3) {
      const { db } = await connectToDatabase()
      const productId = segments[2]
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '0', 10)

      const cursor = db.collection('feedback_submissions')
        .find({ productId })
        .sort({ createdAt: -1 })

      const feedbacks = limit > 0
        ? await cursor.limit(limit).toArray()
        : await cursor.toArray()

      const total = await db.collection('feedback_submissions').countDocuments({ productId })

      return NextResponse.json({ success: true, feedbacks, total })
    }

    // GET /api/users/:phone/feedback - Get user's feedback submissions
    if (segments[0] === 'users' && segments.length === 3 && segments[2] === 'feedback') {
      const { db } = await connectToDatabase()
      const phone = decodeURIComponent(segments[1])

      const feedbacks = await db.collection('feedback_submissions')
        .find({ userPhone: phone })
        .sort({ createdAt: -1 })
        .toArray()

      return NextResponse.json({ success: true, feedbacks })
    }

    // GET /api/admin/feedback - Get all feedback submissions (admin view)
    // POST /api/admin/feedback/:id/publish - show or hide a submission publicly
    if (segments[0] === 'admin' && segments[1] === 'feedback' && segments.length === 4 && segments[3] === 'publish') {
      const body = await request.json().catch(() => ({}))
      const { db } = await connectToDatabase()
      const publish = !!body.publish

      const result = await db.collection('feedback_submissions').updateOne(
        { id: segments[2] },
        { $set: { publishedAsReview: publish, publishedAt: publish ? new Date().toISOString() : null } }
      )
      if (!result.matchedCount) {
        return NextResponse.json({ success: false, message: 'Feedback not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, publishedAsReview: publish })
    }

    if (segments[0] === 'admin' && segments[1] === 'feedback' && segments.length === 2) {
      const { db } = await connectToDatabase()

      const feedbacks = await db.collection('feedback_submissions')
        .find({})
        .sort({ createdAt: -1 })
        .limit(1000)
        .toArray()

      return NextResponse.json({ success: true, feedbacks })
    }

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const pathname = request.nextUrl.pathname
  const segments = getPathSegments(pathname)

    // Every admin route requires the admin password, except the login check.
    if (segments[0] === 'admin' && segments[1] !== 'auth' && !requireAdmin(request)) {
      return adminDenied()
    }

  try {
    // POST /api/razorpay/webhook - Razorpay webhook for payment events
    if (segments[0] === 'razorpay' && segments[1] === 'webhook') {
      const rawBody = await request.text()
      const signature = request.headers.get('x-razorpay-signature')
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

      // Verify webhook signature if secret is configured
      if (webhookSecret && signature) {
        const isValid = verifyRazorpaySignature(rawBody, signature, webhookSecret)
        if (!isValid) {
          console.error('Invalid Razorpay webhook signature')
          return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 })
        }
      }

      const event = JSON.parse(rawBody)
      console.log('Razorpay webhook received:', event.event)

      // Handle payment.captured event
      if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity
        const paymentId = payment.id
        const amount = payment.amount / 100 // Convert from paise to rupees
        const email = payment.email
        const contact = payment.contact
        const notes = payment.notes || {}

        const { db } = await connectToDatabase()

        // Check if order already exists for this payment
        const existingOrder = await db.collection('orders').findOne({ paymentId })
        
        if (existingOrder) {
          console.log(`Order already exists for payment ${paymentId}`)
          return NextResponse.json({ success: true, message: 'Order already exists' })
        }

        // Check if we have a pending order stored (by phone number since we don't have paymentId yet)
        // Normalize phone number for matching
        const normalizedContact = contact?.startsWith('+91') ? contact : `+91${contact}`
        const pendingOrder = await db.collection('pending_payments').findOne({ 
          $or: [
            { phone: normalizedContact },
            { phone: contact },
            { email: email }
          ],
          status: 'pending'
        })

        if (pendingOrder) {
          // Create order from pending order data
          const order = {
            orderId: uuidv4(),
            customerName: pendingOrder.customerName,
            email: pendingOrder.email || email,
            phone: pendingOrder.phone || normalizedContact,
            address: pendingOrder.address,
            pincode: pendingOrder.pincode,
            city: pendingOrder.city || '',
            state: pendingOrder.state || '',
            subtotal: pendingOrder.subtotal,
            shippingFee: pendingOrder.shippingFee || 0,
            products: pendingOrder.products,
            totalAmount: pendingOrder.totalAmount,
            couponCode: pendingOrder.couponCode || null,
            couponDiscount: pendingOrder.couponDiscount || 0,
            status: 'Confirmed',
            paymentId: paymentId,
            userId: pendingOrder.userId || null,
            createdAt: new Date().toISOString(),
            createdVia: 'webhook'
          }

          await db.collection('orders').insertOne(order)
          await db.collection('pending_payments').deleteOne({ _id: pendingOrder._id })

          console.log(`Order ${order.orderId} created via webhook for payment ${paymentId}`)
          return NextResponse.json({ success: true, order })
        } else {
          // Store payment info for manual processing if no pending order found
          await db.collection('unclaimed_payments').insertOne({
            paymentId,
            amount,
            email,
            contact: normalizedContact,
            notes,
            capturedAt: new Date().toISOString(),
            status: 'needs_manual_processing'
          })

          console.log(`Payment ${paymentId} stored for manual processing - no pending order found`)
          return NextResponse.json({ success: true, message: 'Payment stored for manual processing' })
        }
      }

      return NextResponse.json({ success: true, message: 'Event received' })
    }

    // POST /api/review/:token - submit a review and issue the thank-you coupon.
    //
    // The ₹20 is paid for WRITING a review, never for a positive one. Rating is
    // stored exactly as given. Incentivised reviews are labelled on the site so
    // the discount is disclosed rather than hidden.
    if (segments[0] === 'review' && segments.length === 2) {
      const body = await request.json()
      const { db } = await connectToDatabase()

      const rr = await db.collection('review_requests').findOne({ token: segments[1] })
      if (!rr) {
        return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 })
      }
      if (rr.submittedAt) {
        return NextResponse.json({ success: true, alreadySubmitted: true, couponCode: rr.couponCode })
      }

      const rating = Math.max(1, Math.min(5, parseInt(body.rating, 10) || 0))
      if (!rating) {
        return NextResponse.json({ success: false, error: 'Please choose a rating' }, { status: 400 })
      }

      const now = new Date()
      const productId = (rr.productIds && rr.productIds[0]) || 'begood-abar-001'

      await db.collection('reviews').insertOne({
        id: uuidv4(),
        productId,
        orderId: rr.orderId,
        name: (body.name || rr.customerName || 'BeGood customer').toString().slice(0, 60),
        role: 'Verified buyer',
        rating,
        comment: (body.comment || '').toString().slice(0, 800),
        date: now.toISOString(),
        approved: true,
        incentivised: true,
        source: 'review_request'
      })

      // Unique single-use coupon, valid 90 days.
      const code = 'REV' + Math.random().toString(36).slice(2, 8).toUpperCase()
      const expiry = new Date(now.getTime() + 90 * 86400000)
      await db.collection('coupons').insertOne({
        id: uuidv4(),
        code,
        discountType: 'fixed',
        discountValue: 20,
        maxUses: 1,
        usedCount: 0,
        expiryDate: expiry.toISOString(),
        isActive: true,
        createdAt: now.toISOString(),
        note: `Review reward for order ${rr.orderId}`
      })

      await db.collection('review_requests').updateOne(
        { token: segments[1] },
        { $set: { submittedAt: now.toISOString(), rating, comment: body.comment || '', couponCode: code, status: 'submitted' } }
      )

      if (rr.email) {
        await sendEmail({
          to: rr.email,
          toName: rr.customerName,
          subject: `Thank you — here's ₹20 off your next order`,
          html: layout({
            heading: 'Thank you for the honest review',
            body: `<p>It genuinely helps other people decide whether A-Bar is for them.</p>
                   <p>Here's ₹20 off your next order, as promised:</p>
                   <p style="font-size:22px;font-weight:700;letter-spacing:2px;color:#3f5a46;background:#dce6d7;padding:12px 16px;border-radius:10px;display:inline-block;">${code}</p>`,
            ctaLabel: 'Use it now',
            ctaUrl: siteLink('shop'),
            footnote: `Valid for 90 days, one use.`
          })
        })
      }

      return NextResponse.json({ success: true, couponCode: code })
    }

    // POST /api/cron/retention - the whole post-purchase sequence in one job.
    //
    // Two ways in:
    //   1. Vercel Cron, which sends Authorization: Bearer $CRON_SECRET
    //   2. A signed-in admin from the Retention page, via x-admin-key
    // The second exists so running this by hand does not require a terminal.
    if (segments[0] === 'cron' && segments[1] === 'retention') {
      const secret = process.env.CRON_SECRET
      const auth = request.headers.get('authorization') || ''
      const viaCron = !!secret && auth === `Bearer ${secret}`
      const viaAdmin = requireAdmin(request)
      if (!viaCron && !viaAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      const { db } = await connectToDatabase()
      const site = siteUrl()
      const now = Date.now()
      const daysAgo = (n) => new Date(now - n * 86400000)

      // ?dryRun=1  - report exactly who would be emailed, send nothing.
      // ?reviewMaxAge=200 - widen the review window so customers who ordered
      //   before this system existed can still be asked. Without it the window
      //   is 7-21 days and every older customer is silently skipped forever.
      const url = new URL(request.url)
      const dryRun = url.searchParams.get('dryRun') === '1'
      const reviewMaxAge = Math.min(400, parseInt(url.searchParams.get('reviewMaxAge') || '21', 10) || 21)

      // ?testEmail=you@example.com - send one sample of each email to a single
      // address so the exact wording, layout and deliverability can be checked
      // before a single real customer is contacted. Touches no customer data.
      const testEmail = (url.searchParams.get('testEmail') || '').trim()
      if (testEmail) {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testEmail)) {
          return NextResponse.json({ success: false, error: 'That does not look like a valid email address' }, { status: 400 })
        }

        const savedT = await db.collection('email_templates').find({}).toArray()
        const byKeyT = Object.fromEntries(savedT.map((t) => [t.key, t]))
        const testVars = { name: 'there', site }

        const samples = TEMPLATE_KEYS.map((key) => {
          const t = mergeTemplate(key, byKeyT[key])
          return {
            key,
            subject: fillTemplate(t.subject, testVars),
            html: layout({
              heading: fillTemplate(t.heading, testVars),
              body: bodyToHtml(t.body, testVars),
              ctaLabel: t.ctaLabel,
              ctaUrl: siteLink(t.ctaPath || 'shop'),
              footnote: fillTemplate(t.footnote, testVars)
            })
          }
        })

        const sent = []
        for (const sample of samples) {
          const r = await sendEmail({
            to: testEmail,
            toName: 'BeGood test',
            subject: `[TEST] ${sample.subject}`,
            html: sample.html
          })
          sent.push({ key: sample.key, subject: sample.subject, ok: r.ok, reason: r.reason || null })
        }

        return NextResponse.json({ success: true, testEmail, sent })
      }

      // Saved wording wins over the coded defaults.
      const savedTemplates = await db.collection('email_templates').find({}).toArray()
      const savedByKey = Object.fromEntries(savedTemplates.map((t) => [t.key, t]))
      const render = (key, vars, ctaUrl) => {
        const t = mergeTemplate(key, savedByKey[key])
        return {
          subject: fillTemplate(t.subject, vars),
          html: layout({
            heading: fillTemplate(t.heading, vars),
            body: bodyToHtml(t.body, vars),
            ctaLabel: t.ctaLabel,
            ctaUrl: ctaUrl || siteLink(t.ctaPath),
            footnote: fillTemplate(t.footnote, vars)
          })
        }
      }

      const summary = { dryRun, reviewMaxAge, usage: 0, reviewRequests: 0, replenishment: 0, skipped: 0 }
      const wouldSend = { usage: [], reviewRequests: [], replenishment: [] }

      // In a dry run nothing is sent and nothing is written.
      const deliver = async (kind, order, payload) => {
        if (dryRun) {
          wouldSend[kind].push({ orderId: order.orderId, email: order.email })
          return { ok: false, dry: true }
        }
        return sendEmail(payload)
      }

      // --- Day 3: how to actually use it -------------------------------------
      // The most under-rated message here. A-Bar is usage-dependent: eaten five
      // minutes before an exam it will seem not to work, and that customer is
      // gone without ever telling us why.
      const usageOrders = await db.collection('orders').find({
        createdAt: { $lte: daysAgo(3).toISOString(), $gte: daysAgo(6).toISOString() },
        usageEmailSentAt: { $exists: false },
        email: { $exists: true, $ne: null, $ne: '' }
      }).limit(50).toArray()

      for (const o of usageOrders) {
        const msg = render('usage', { name: o.customerName || 'there', site })
        const r = await deliver('usage', o, {
          to: o.email,
          toName: o.customerName,
          subject: msg.subject,
          html: msg.html
        })
        if (r.ok) {
          await db.collection('orders').updateOne({ orderId: o.orderId }, { $set: { usageEmailSentAt: new Date().toISOString() } })
          summary.usage++
        }
      }

      // --- Day 7: review request + ₹20 ---------------------------------------
      const reviewOrders = await db.collection('orders').find({
        createdAt: { $lte: daysAgo(7).toISOString(), $gte: daysAgo(reviewMaxAge).toISOString() },
        email: { $exists: true, $ne: null, $ne: '' }
      }).limit(50).toArray()

      for (const o of reviewOrders) {
        const existing = await db.collection('review_requests').findOne({ orderId: o.orderId })
        if (existing) { summary.skipped++; continue }

        const token = uuidv4().replace(/-/g, '')
        const productIds = (o.products || []).map((p) => p.productId).filter(Boolean)

        if (dryRun) {
          wouldSend.reviewRequests.push({ orderId: o.orderId, email: o.email })
          continue
        }

        await db.collection('review_requests').insertOne({
          id: uuidv4(),
          orderId: o.orderId,
          phone: o.phone,
          email: o.email,
          customerName: o.customerName || '',
          productIds,
          token,
          sentAt: new Date().toISOString(),
          status: 'sent'
        })

        const msg = render('reviewRequest', { name: o.customerName || 'there', site }, siteLink(`review/${token}`))
        const r = await sendEmail({
          to: o.email,
          toName: o.customerName,
          subject: msg.subject,
          html: msg.html
        })
        if (r.ok) summary.reviewRequests++
      }

      // --- Day 25: replenishment --------------------------------------------
      const replenOrders = await db.collection('orders').find({
        createdAt: { $lte: daysAgo(25).toISOString(), $gte: daysAgo(40).toISOString() },
        reminderSentAt: { $exists: false },
        email: { $exists: true, $ne: null, $ne: '' }
      }).limit(50).toArray()

      for (const o of replenOrders) {
        const ids = (o.products || []).map((p) => p.productId || '')
        const hamperOnly = ids.length > 0 && ids.every((id) => String(id).includes('hamper'))
        if (hamperOnly) { summary.skipped++; continue }

        // Never nag someone who already came back.
        const digits = String(o.phone || '').replace(/\D/g, '').slice(-10)
        const later = digits ? await db.collection('orders').findOne({
          phone: { $regex: digits + '$' },
          createdAt: { $gt: o.createdAt }
        }) : null
        if (later) {
          await db.collection('orders').updateOne({ orderId: o.orderId }, { $set: { reminderSentAt: 'skipped_reordered' } })
          summary.skipped++
          continue
        }

        const msg = render('replenishment', { name: o.customerName || 'there', site })
        const r = await deliver('replenishment', o, {
          to: o.email,
          toName: o.customerName,
          subject: msg.subject,
          html: msg.html
        })
        if (r.ok) {
          await db.collection('orders').updateOne({ orderId: o.orderId }, { $set: { reminderSentAt: new Date().toISOString() } })
          summary.replenishment++
        }
      }

      return NextResponse.json({ success: true, summary, wouldSend: dryRun ? wouldSend : undefined })
    }

    // POST /api/pending-payment - Store pending payment data before initiating Razorpay
    if (segments[0] === 'pending-payment' && segments.length === 1) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      // Store pending payment with phone as identifier (before we have paymentId)
      const pendingData = {
        ...body,
        createdAt: new Date().toISOString(),
        status: 'pending'
      }
      
      // Upsert based on phone number (replace if exists)
      await db.collection('pending_payments').updateOne(
        { phone: body.phone },
        { $set: pendingData },
        { upsert: true }
      )
      
      return NextResponse.json({ success: true, message: 'Pending payment stored' })
    }

    // POST /api/orders - Create new order
    if (segments[0] === 'orders' && segments.length === 1) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      // Check if order already exists for this payment (prevent duplicates)
      if (body.paymentId) {
        const existingOrder = await db.collection('orders').findOne({ paymentId: body.paymentId })
        if (existingOrder) {
          console.log(`Order already exists for payment ${body.paymentId}, returning existing order`)
          return NextResponse.json({ success: true, order: existingOrder, duplicate: true })
        }
      }
      
      // Hampers are prepaid only. The UI hides COD for them, but a crafted
      // request could still reach here, so reject it server-side too.
      if (body.paymentMethod === 'cod' && cartHasHamper(body.products)) {
        return NextResponse.json(
          { success: false, error: 'Cash on Delivery is not available for hamper orders. Please pay online.' },
          { status: 400 }
        )
      }

      const order = {
        orderId: uuidv4(),
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        pincode: body.pincode,
        city: body.city || '',
        state: body.state || '',
        subtotal: body.subtotal || body.totalAmount,
        shippingFee: body.shippingFee || 0,
        codFee: body.codFee || 0,
        couponCode: body.couponCode || null,
        couponDiscount: body.couponDiscount || 0,
        products: body.products,
        totalAmount: body.totalAmount,
        paymentMethod: body.paymentMethod || 'online',
        status: body.paymentMethod === 'cod' ? 'Pending COD' : 'Confirmed',
        paymentId: body.paymentId || null,
        userId: body.userId || null,
        orderType: body.orderType || 'regular',
        affiliateCode: body.affiliateCode || null,
        createdAt: new Date().toISOString(),
        createdVia: 'frontend'
      }
      
      await db.collection('orders').insertOne(order)
      
      // Clean up pending payment after successful order creation
      if (body.phone) {
        await db.collection('pending_payments').deleteOne({ phone: body.phone })
      }
      
      // Track order completion in analytics
      await db.collection('analytics').insertOne({
        event: 'order_completed',
        params: {
          orderId: order.orderId,
          amount: order.totalAmount,
          paymentMethod: order.paymentMethod
        },
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')
      })
      
      return NextResponse.json({ success: true, order })
    }

    // POST /api/users - Store user data
    if (segments[0] === 'users' && segments.length === 1) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const userData = {
        oderId: uuidv4(),
        uid: body.uid,
        phone: body.phone,
        name: body.name || '',
        email: body.email || '',
        age: body.age || '',
        addresses: body.addresses || [],
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Upsert user by uid or phone
      await db.collection('users').updateOne(
        { $or: [{ uid: body.uid }, { phone: body.phone }] },
        { $set: userData },
        { upsert: true }
      )
      
      return NextResponse.json({ success: true, message: 'User data stored' })
    }

    // POST /api/subscriptions - Create subscription order
    if (segments[0] === 'subscriptions' && segments.length === 1) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const subscription = {
        subscriptionId: uuidv4(),
        orderId: uuidv4(),
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        pincode: body.pincode,
        city: body.city || '',
        state: body.state || '',
        barsPerMonth: body.barsPerMonth,
        durationMonths: 3,
        totalBars: body.barsPerMonth * 3,
        pricePerBar: 100,
        totalAmount: body.barsPerMonth * 3 * 100,
        deliverySchedule: [],
        paymentId: body.paymentId,
        userId: body.userId || null,
        status: 'active',
        orderType: 'subscription',
        createdAt: new Date().toISOString()
      }
      
      // Generate delivery schedule (1 delivery per month for 3 months)
      const startDate = new Date()
      for (let i = 0; i < 3; i++) {
        const deliveryDate = new Date(startDate)
        deliveryDate.setMonth(deliveryDate.getMonth() + i)
        subscription.deliverySchedule.push({
          month: i + 1,
          barsCount: body.barsPerMonth,
          scheduledDate: deliveryDate.toISOString(),
          status: i === 0 ? 'processing' : 'scheduled',
          deliveredAt: null
        })
      }
      
      await db.collection('subscriptions').insertOne(subscription)
      
      // Also create as an order for tracking
      const order = {
        ...subscription,
        products: [{
          productId: 'begood-abar-001',
          productName: 'A-Bar (Subscription)',
          variant: { size: '40g', price: 100 },
          quantity: subscription.totalBars,
          price: 100
        }],
        subtotal: subscription.totalAmount,
        shippingFee: 0,
        couponDiscount: 0,
        status: 'Subscription Active'
      }
      await db.collection('orders').insertOne(order)
      
      return NextResponse.json({ success: true, subscription, order })
    }

    // POST /api/notify - Store email for upcoming product notifications
    if (segments[0] === 'notify' && segments.length === 1) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const notification = {
        email: body.email,
        product: body.product || 'P-Bar',
        createdAt: new Date().toISOString()
      }
      
      await db.collection('notifications').insertOne(notification)
      
      return NextResponse.json({ success: true, message: 'Email saved successfully' })
    }

    // POST /api/admin/auth - Admin authentication
    if (segments[0] === 'admin' && segments[1] === 'auth') {
      const { password } = await request.json()
      
      if (password === process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ success: true, authenticated: true })
      }
      
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 })
    }

    // POST /api/admin/email-templates - save or reset one template
    if (segments[0] === 'admin' && segments[1] === 'email-templates') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      const key = body.key

      if (!TEMPLATE_KEYS.includes(key)) {
        return NextResponse.json({ success: false, message: 'Unknown template' }, { status: 400 })
      }

      // Reset simply drops the row so the coded default applies again.
      if (body.reset) {
        await db.collection('email_templates').deleteOne({ key })
        return NextResponse.json({ success: true, template: { ...DEFAULT_TEMPLATES[key], isEdited: false } })
      }

      const doc = {
        key,
        subject: String(body.subject || '').slice(0, 200),
        heading: String(body.heading || '').slice(0, 200),
        body: String(body.body || '').slice(0, 4000),
        ctaLabel: String(body.ctaLabel || '').slice(0, 60),
        footnote: String(body.footnote || '').slice(0, 400),
        updatedAt: new Date().toISOString()
      }

      if (!doc.subject || !doc.heading || !doc.body) {
        return NextResponse.json({ success: false, message: 'Subject, heading and body are all required' }, { status: 400 })
      }

      await db.collection('email_templates').updateOne({ key }, { $set: doc }, { upsert: true })
      return NextResponse.json({ success: true, template: { ...mergeTemplate(key, doc), isEdited: true } })
    }

    // POST /api/admin/reviews - Add review (admin only)
    if (segments[0] === 'admin' && segments[1] === 'reviews') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const review = {
        productId: body.productId,
        name: body.name,
        rating: body.rating,
        comment: body.comment,
        date: new Date().toISOString(),
        approved: true
      }
      
      await db.collection('reviews').insertOne(review)
      
      return NextResponse.json({ success: true, review })
    }

    // POST /api/admin/products - Add new product (admin only)
    if (segments[0] === 'admin' && segments[1] === 'products') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      // Check if product ID already exists
      const existing = await db.collection('products').findOne({ id: body.id })
      if (existing) {
        return NextResponse.json({ success: false, message: 'Product ID already exists' }, { status: 400 })
      }
      
      const product = {
        ...body,
        createdAt: new Date().toISOString()
      }
      
      await db.collection('products').insertOne(product)
      
      return NextResponse.json({ success: true, product })
    }

    // POST /api/analytics/track - Track analytics events
    if (segments[0] === 'analytics' && segments[1] === 'track') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      await db.collection('analytics').insertOne({
        event: body.event,
        params: body.params || {},
        timestamp: body.timestamp || new Date().toISOString(),
        userAgent: body.userAgent || request.headers.get('user-agent')
      })
      
      return NextResponse.json({ success: true })
    }

    // POST /api/users - Create or update user (after OTP verification)
    if (segments[0] === 'users' && segments.length === 1) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { phone, name, email, age } = body
      
      if (!phone) {
        return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 })
      }
      
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ phone })
      
      if (existingUser) {
        // Update existing user
        await db.collection('users').updateOne(
          { phone },
          { 
            $set: { 
              name: name || existingUser.name,
              email: email || existingUser.email,
              age: age || existingUser.age,
              updatedAt: new Date().toISOString()
            }
          }
        )
        const updatedUser = await db.collection('users').findOne({ phone })
        return NextResponse.json({ success: true, user: updatedUser, isNewUser: false })
      }
      
      // Create new user
      const newUser = {
        id: uuidv4(),
        phone,
        name: name || '',
        email: email || '',
        age: age || null,
        addresses: [],
        createdAt: new Date().toISOString()
      }
      
      await db.collection('users').insertOne(newUser)
      return NextResponse.json({ success: true, user: newUser, isNewUser: true })
    }

    // POST /api/users/update - Update user profile (only updates existing users)
    if (segments[0] === 'users' && segments[1] === 'update') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { phone, name, email, age } = body
      
      if (!phone) {
        return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 })
      }
      
      // Check if user exists - only update existing users, don't create new ones
      const existingUser = await db.collection('users').findOne({ phone })
      
      if (existingUser) {
        // Update existing user
        const updateFields = { updatedAt: new Date().toISOString() }
        if (name !== undefined) updateFields.name = name
        if (email !== undefined) updateFields.email = email
        if (age !== undefined) updateFields.age = age
        
        await db.collection('users').updateOne(
          { phone },
          { $set: updateFields }
        )
        
        const updatedUser = await db.collection('users').findOne({ phone })
        return NextResponse.json({ success: true, user: updatedUser })
      } else {
        // User doesn't exist - return error (user should be created after OTP verification)
        return NextResponse.json({ 
          success: false, 
          message: 'User not found. Please complete OTP verification first.' 
        }, { status: 404 })
      }
    }

    // POST /api/users/addresses - Add new address (only for existing users)
    if (segments[0] === 'users' && segments[1] === 'addresses') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { phone, address } = body
      
      if (!phone || !address) {
        return NextResponse.json({ success: false, message: 'Phone and address are required' }, { status: 400 })
      }

      // Check if user exists first
      const existingUser = await db.collection('users').findOne({ phone })
      if (!existingUser) {
        return NextResponse.json({ 
          success: false, 
          message: 'User not found. Please complete OTP verification first.' 
        }, { status: 404 })
      }

      // Validate pincode if provided
      if (address.pincode) {
        if (!/^\d{6}$/.test(address.pincode)) {
          return NextResponse.json({ success: false, message: 'Pincode must be 6 digits' }, { status: 400 })
        }
        
        const pincodeResult = await validatePincode(address.pincode)
        if (!pincodeResult.valid) {
          return NextResponse.json({ success: false, message: 'Invalid pincode. Please enter a valid Indian pincode.' }, { status: 400 })
        }
        
        // Auto-fill city and state from pincode validation
        address.city = pincodeResult.city
        address.state = pincodeResult.state
      }
      
      const newAddress = {
        id: uuidv4(),
        label: address.label || 'Home',
        fullAddress: address.fullAddress,
        pincode: address.pincode,
        city: address.city || '',
        state: address.state || '',
        isDefault: address.isDefault || false,
        createdAt: new Date().toISOString()
      }
      
      // If this is set as default, remove default from other addresses
      if (newAddress.isDefault) {
        await db.collection('users').updateOne(
          { phone },
          { $set: { 'addresses.$[].isDefault': false } }
        )
      }
      
      await db.collection('users').updateOne(
        { phone },
        { $push: { addresses: newAddress } }
      )
      
      const updatedUser = await db.collection('users').findOne({ phone })
      return NextResponse.json({ success: true, addresses: updatedUser.addresses })
    }

    // POST /api/admin/affiliates - Create new affiliate
    if (segments[0] === 'admin' && segments[1] === 'affiliates' && segments.length === 2) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { code, name, phone, email, password } = body
      
      if (!code || !name || !password) {
        return NextResponse.json({ success: false, message: 'Code, name, and password are required' }, { status: 400 })
      }
      
      // Check if affiliate code already exists
      const existingAffiliate = await db.collection('affiliates').findOne({ code: code.toUpperCase() })
      if (existingAffiliate) {
        return NextResponse.json({ success: false, message: 'Affiliate code already exists' }, { status: 400 })
      }
      
      const affiliate = {
        id: uuidv4(),
        code: code.toUpperCase(),
        name,
        phone: phone || '',
        email: email || '',
        password, // In production, this should be hashed
        isActive: true,
        clicks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.collection('affiliates').insertOne(affiliate)
      
      return NextResponse.json({ success: true, affiliate: { ...affiliate, password: undefined } })
    }

    // POST /api/admin/affiliates/:code/toggle - Toggle affiliate active status
    if (segments[0] === 'admin' && segments[1] === 'affiliates' && segments.length === 4 && segments[3] === 'toggle') {
      const { db } = await connectToDatabase()
      const code = segments[2].toUpperCase()
      
      const affiliate = await db.collection('affiliates').findOne({ code })
      if (!affiliate) {
        return NextResponse.json({ success: false, message: 'Affiliate not found' }, { status: 404 })
      }
      
      const newStatus = !affiliate.isActive
      await db.collection('affiliates').updateOne(
        { code },
        { $set: { isActive: newStatus, updatedAt: new Date().toISOString() } }
      )
      
      return NextResponse.json({ success: true, isActive: newStatus })
    }

    // POST /api/admin/affiliates/:code/update - Update affiliate details
    if (segments[0] === 'admin' && segments[1] === 'affiliates' && segments.length === 4 && segments[3] === 'update') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      const code = segments[2].toUpperCase()
      
      const affiliate = await db.collection('affiliates').findOne({ code })
      if (!affiliate) {
        return NextResponse.json({ success: false, message: 'Affiliate not found' }, { status: 404 })
      }
      
      const updateFields = { updatedAt: new Date().toISOString() }
      if (body.name) updateFields.name = body.name
      if (body.phone !== undefined) updateFields.phone = body.phone
      if (body.email !== undefined) updateFields.email = body.email
      if (body.password) updateFields.password = body.password
      
      await db.collection('affiliates').updateOne({ code }, { $set: updateFields })
      
      const updatedAffiliate = await db.collection('affiliates').findOne({ code })
      return NextResponse.json({ success: true, affiliate: { ...updatedAffiliate, password: undefined } })
    }

    // POST /api/affiliate/auth - Affiliate login
    if (segments[0] === 'affiliate' && segments[1] === 'auth') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { code, password } = body
      
      if (!code || !password) {
        return NextResponse.json({ success: false, message: 'Code and password are required' }, { status: 400 })
      }
      
      const affiliate = await db.collection('affiliates').findOne({ 
        code: code.toUpperCase(), 
        password,
        isActive: true 
      })
      
      if (!affiliate) {
        return NextResponse.json({ success: false, message: 'Invalid credentials or affiliate is inactive' }, { status: 401 })
      }
      
      return NextResponse.json({ 
        success: true, 
        affiliate: {
          code: affiliate.code,
          name: affiliate.name,
          isActive: affiliate.isActive
        }
      })
    }

    // POST /api/affiliate/track - Track affiliate click
    if (segments[0] === 'affiliate' && segments[1] === 'track') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { code } = body
      
      if (!code) {
        return NextResponse.json({ success: false, message: 'Affiliate code is required' }, { status: 400 })
      }
      
      const affiliate = await db.collection('affiliates').findOne({ code: code.toUpperCase(), isActive: true })
      
      if (!affiliate) {
        return NextResponse.json({ success: false, message: 'Invalid or inactive affiliate' }, { status: 400 })
      }
      
      // Increment click count
      await db.collection('affiliates').updateOne(
        { code: code.toUpperCase() },
        { $inc: { clicks: 1 } }
      )
      
      return NextResponse.json({ success: true, message: 'Click tracked' })
    }

    // POST /api/admin/coupons - Create new coupon
    if (segments[0] === 'admin' && segments[1] === 'coupons') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { code, discountType, discountValue, maxUses, expiryDate } = body
      
      if (!code || !discountType || discountValue === undefined) {
        return NextResponse.json({ success: false, message: 'Code, discount type, and discount value are required' }, { status: 400 })
      }
      
      // Check if coupon code already exists
      const existingCoupon = await db.collection('coupons').findOne({ code: code.toUpperCase() })
      if (existingCoupon) {
        return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 400 })
      }
      
      const coupon = {
        id: uuidv4(),
        code: code.toUpperCase(),
        discountType, // 'fixed' or 'percentage'
        discountValue: parseFloat(discountValue),
        maxUses: maxUses ? parseInt(maxUses) : null, // null means unlimited
        usedCount: 0,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.collection('coupons').insertOne(coupon)
      
      return NextResponse.json({ success: true, coupon })
    }

    // POST /api/coupons/validate - Validate and apply coupon
    if (segments[0] === 'coupons' && segments[1] === 'validate') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { code, userId, userPhone, orderTotal, totalQuantity } = body
      
      if (!code) {
        return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 })
      }
      
      const coupon = await db.collection('coupons').findOne({ code: code.toUpperCase(), isActive: true })
      
      if (!coupon) {
        return NextResponse.json({ success: false, message: 'Invalid coupon code' }, { status: 400 })
      }
      
      // Check if coupon has expired
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json({ success: false, message: 'Coupon has expired' }, { status: 400 })
      }
      
      // Check if max uses reached
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ success: false, message: 'Coupon usage limit reached' }, { status: 400 })
      }
      
      // Check if user has already used this coupon
      const userUsage = await db.collection('coupon_usage').findOne({
        couponId: coupon.id,
        $or: [
          { userId: userId },
          { userPhone: userPhone }
        ]
      })
      
      if (userUsage) {
        return NextResponse.json({ success: false, message: 'You have already used this coupon' }, { status: 400 })
      }
      
      // Calculate discount
      let discountAmount = 0
      let appliedTier = null
      
      // Handle bulk tiered discount (KRISH coupon)
      if (coupon.discountType === 'bulk_tiered') {
        const qty = totalQuantity || 0
        
        // Check minimum quantity
        if (qty < 5) {
          return NextResponse.json({ success: false, message: 'Minimum 5 bars required for this code' }, { status: 400 })
        }
        
        // Apply tiered discount based on quantity
        if (qty >= 15) {
          // 15+ bars: ₹235 off (Final: ₹1,640 from ₹1,875)
          discountAmount = 235
          appliedTier = '15+'
        } else if (qty >= 10) {
          // 10+ bars: ₹125 off (Final: ₹1,125 from ₹1,250)
          discountAmount = 125
          appliedTier = '10+'
        } else if (qty >= 5) {
          // 5+ bars: ₹50 off (Final: ₹575 from ₹625)
          discountAmount = 50
          appliedTier = '5+'
        }
        
        // Ensure discount doesn't exceed order total
        discountAmount = Math.min(discountAmount, orderTotal)
        
        return NextResponse.json({ 
          success: true, 
          coupon: {
            id: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: discountAmount,
            discountAmount,
            appliedTier,
            isBulkDiscount: true,
            canCombine: false
          }
        })
      }
      
      // Regular coupon discount calculation
      if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue
      } else if (coupon.discountType === 'percentage') {
        discountAmount = Math.round((orderTotal * coupon.discountValue) / 100)
      }
      
      // Ensure discount doesn't exceed order total
      discountAmount = Math.min(discountAmount, orderTotal)
      
      return NextResponse.json({ 
        success: true, 
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount,
          isBulkDiscount: false,
          canCombine: true
        }
      })
    }

    // POST /api/coupons/apply - Apply coupon after order completion
    if (segments[0] === 'coupons' && segments[1] === 'apply') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { couponId, couponCode, userId, userPhone, orderId, discountAmount } = body
      
      if (!couponId || !orderId) {
        return NextResponse.json({ success: false, message: 'Coupon ID and Order ID are required' }, { status: 400 })
      }
      
      // Record the usage
      const usageRecord = {
        id: uuidv4(),
        couponId,
        couponCode,
        userId: userId || null,
        userPhone: userPhone || null,
        orderId,
        discountAmount: discountAmount || 0,
        usedAt: new Date().toISOString()
      }
      
      await db.collection('coupon_usage').insertOne(usageRecord)
      
      // Increment the used count
      await db.collection('coupons').updateOne(
        { id: couponId },
        { 
          $inc: { usedCount: 1 },
          $set: { updatedAt: new Date().toISOString() }
        }
      )
      
      return NextResponse.json({ success: true })
    }

    // POST /api/contact - Handle contact form submission (stores in DB for record)
    if (segments[0] === 'contact' && segments.length === 1) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { name, email, phone, subject, message } = body
      
      if (!name || !email || !subject || !message) {
        return NextResponse.json({ success: false, message: 'Name, email, subject, and message are required' }, { status: 400 })
      }
      
      // Store contact message in database
      const contactMessage = {
        id: uuidv4(),
        name,
        email,
        phone: phone || '',
        subject,
        message,
        status: 'pending', // pending, responded, closed
        createdAt: new Date().toISOString()
      }
      
      await db.collection('contact_messages').insertOne(contactMessage)
      
      return NextResponse.json({ success: true, message: 'Message received successfully' })
    }

    // POST /api/admin/feedback/questions - Save/update feedback questionnaire (admin) for a specific product
    if (segments[0] === 'admin' && segments[1] === 'feedback' && segments[2] === 'questions') {
      const body = await request.json()
      const { db } = await connectToDatabase()

      const { questions, title, description, productId, productName } = body

      if (!productId) {
        return NextResponse.json({ success: false, message: 'productId is required' }, { status: 400 })
      }
      if (!Array.isArray(questions)) {
        return NextResponse.json({ success: false, message: 'Questions must be an array' }, { status: 400 })
      }

      // Validate each question
      const validTypes = ['short_text', 'long_text', 'single_choice', 'multiple_choice', 'dropdown', 'linear_scale', 'star_rating', 'date', 'time', 'email', 'number']
      const sanitized = questions.map((q) => {
        if (!q.type || !validTypes.includes(q.type)) {
          throw new Error(`Invalid question type: ${q.type}`)
        }
        if (!q.question || !q.question.trim()) {
          throw new Error('Every question must have text')
        }
        const base = {
          id: q.id || uuidv4(),
          type: q.type,
          question: q.question.trim(),
          required: !!q.required
        }
        if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.type)) {
          base.options = Array.isArray(q.options) ? q.options.filter(o => o && o.trim()).map(o => o.trim()) : []
          if (base.options.length === 0) {
            throw new Error(`Question "${q.question}" must have at least one option`)
          }
        }
        if (q.type === 'linear_scale') {
          const min = parseInt(q.scale?.min ?? 1, 10)
          const max = parseInt(q.scale?.max ?? 5, 10)
          base.scale = {
            min: isNaN(min) ? 1 : min,
            max: isNaN(max) ? 5 : max,
            minLabel: q.scale?.minLabel || '',
            maxLabel: q.scale?.maxLabel || ''
          }
        }
        if (q.type === 'star_rating') {
          const maxR = parseInt(q.maxRating ?? 5, 10)
          base.maxRating = isNaN(maxR) ? 5 : Math.min(Math.max(maxR, 3), 10)
        }
        return base
      })

      // Deactivate any existing active form FOR THIS PRODUCT only
      await db.collection('feedback_questions').updateMany(
        { active: true, productId },
        { $set: { active: false } }
      )

      const form = {
        id: uuidv4(),
        productId,
        productName: productName || '',
        title: title || 'Share your feedback',
        description: description || '',
        questions: sanitized,
        active: true,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      await db.collection('feedback_questions').insertOne(form)

      return NextResponse.json({ success: true, form })
    }

    // POST /api/feedback/submit - Submit product feedback (logged-in users only)
    if (segments[0] === 'feedback' && segments[1] === 'submit' && segments.length === 2) {
      const body = await request.json()
      const { db } = await connectToDatabase()

      const { userPhone, productId, productName, answers } = body

      if (!userPhone) {
        return NextResponse.json({ success: false, message: 'You must be logged in to submit feedback' }, { status: 401 })
      }
      if (!productId) {
        return NextResponse.json({ success: false, message: 'Product selection is required' }, { status: 400 })
      }
      if (!Array.isArray(answers) || answers.length === 0) {
        return NextResponse.json({ success: false, message: 'Answers are required' }, { status: 400 })
      }

      // Verify user exists
      const user = await db.collection('users').findOne({ phone: userPhone })
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found. Please complete OTP verification first.' }, { status: 404 })
      }

      // Check if user has already submitted feedback for this product (once per product per user)
      const existing = await db.collection('feedback_submissions').findOne({ userPhone, productId })
      if (existing) {
        return NextResponse.json({ success: false, message: 'You have already submitted feedback for this product' }, { status: 400 })
      }

      // Load product-specific active questions to validate required fields and ensure form is configured
      const activeForm = await db.collection('feedback_questions').findOne({ active: true, productId })
      if (!activeForm) {
        return NextResponse.json({ success: false, message: 'Feedback form is not configured for this product yet' }, { status: 400 })
      }
      const requiredIds = (activeForm.questions || []).filter(q => q.required).map(q => q.id)
      for (const rid of requiredIds) {
        const ans = answers.find(a => a.questionId === rid)
        if (!ans || ans.answer === null || ans.answer === undefined || ans.answer === '' || (Array.isArray(ans.answer) && ans.answer.length === 0)) {
          return NextResponse.json({ success: false, message: 'Please answer all required questions' }, { status: 400 })
        }
      }

      const submission = {
        id: uuidv4(),
        userId: user.id || null,
        userPhone,
        userName: user.name || '',
        productId,
        productName: productName || '',
        answers: answers.map(a => ({
          questionId: a.questionId,
          question: a.question,
          type: a.type,
          answer: a.answer
        })),
        createdAt: new Date().toISOString()
      }

      await db.collection('feedback_submissions').insertOne(submission)

      return NextResponse.json({ success: true, feedback: submission })
    }

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  const pathname = request.nextUrl.pathname
  const segments = getPathSegments(pathname)

    // Every admin route requires the admin password, except the login check.
    if (segments[0] === 'admin' && segments[1] !== 'auth' && !requireAdmin(request)) {
      return adminDenied()
    }

  try {
    // PUT /api/admin/orders/:id - Update order status
    if (segments[0] === 'admin' && segments[1] === 'orders' && segments.length === 3) {
      const { status } = await request.json()
      const { db } = await connectToDatabase()
      
      const result = await db.collection('orders').updateOne(
        { orderId: segments[2] },
        { $set: { status, updatedAt: new Date().toISOString() } }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true })
    }

    // PUT /api/admin/products/:id - Update product (admin only)
    if (segments[0] === 'admin' && segments[1] === 'products' && segments.length === 3) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { _id, ...updateData } = body
      updateData.updatedAt = new Date().toISOString()
      
      const result = await db.collection('products').updateOne(
        { id: segments[2] },
        { $set: updateData }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true })
    }

    // PUT /api/users/addresses/:addressId - Update address
    if (segments[0] === 'users' && segments[1] === 'addresses' && segments.length === 3) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { phone, address } = body
      const addressId = segments[2]
      
      if (!phone) {
        return NextResponse.json({ success: false, message: 'Phone is required' }, { status: 400 })
      }

      // Validate pincode if provided
      if (address.pincode) {
        if (!/^\d{6}$/.test(address.pincode)) {
          return NextResponse.json({ success: false, message: 'Pincode must be 6 digits' }, { status: 400 })
        }
        
        const pincodeResult = await validatePincode(address.pincode)
        if (!pincodeResult.valid) {
          return NextResponse.json({ success: false, message: 'Invalid pincode. Please enter a valid Indian pincode.' }, { status: 400 })
        }
        
        // Auto-fill city and state from pincode validation
        address.city = pincodeResult.city
        address.state = pincodeResult.state
      }
      
      // If setting as default, remove default from all addresses first
      if (address.isDefault) {
        await db.collection('users').updateOne(
          { phone },
          { $set: { 'addresses.$[].isDefault': false } }
        )
      }
      
      // Update the specific address
      const result = await db.collection('users').updateOne(
        { phone, 'addresses.id': addressId },
        { 
          $set: { 
            'addresses.$.label': address.label,
            'addresses.$.fullAddress': address.fullAddress,
            'addresses.$.pincode': address.pincode,
            'addresses.$.city': address.city,
            'addresses.$.state': address.state,
            'addresses.$.isDefault': address.isDefault,
            'addresses.$.updatedAt': new Date().toISOString()
          }
        }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 })
      }
      
      const updatedUser = await db.collection('users').findOne({ phone })
      return NextResponse.json({ success: true, addresses: updatedUser.addresses })
    }

    // PUT /api/admin/coupons/:id - Update coupon
    if (segments[0] === 'admin' && segments[1] === 'coupons' && segments.length === 3) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      const couponId = segments[2]
      
      const { discountType, discountValue, maxUses, expiryDate, isActive } = body
      
      const updateFields = { updatedAt: new Date().toISOString() }
      
      if (discountType !== undefined) updateFields.discountType = discountType
      if (discountValue !== undefined) updateFields.discountValue = parseFloat(discountValue)
      if (maxUses !== undefined) updateFields.maxUses = maxUses ? parseInt(maxUses) : null
      if (expiryDate !== undefined) updateFields.expiryDate = expiryDate ? new Date(expiryDate).toISOString() : null
      if (isActive !== undefined) updateFields.isActive = isActive
      
      const result = await db.collection('coupons').updateOne(
        { id: couponId },
        { $set: updateFields }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 })
      }
      
      const updatedCoupon = await db.collection('coupons').findOne({ id: couponId })
      return NextResponse.json({ success: true, coupon: updatedCoupon })
    }

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  const pathname = request.nextUrl.pathname
  const segments = getPathSegments(pathname)

    // Every admin route requires the admin password, except the login check.
    if (segments[0] === 'admin' && segments[1] !== 'auth' && !requireAdmin(request)) {
      return adminDenied()
    }

  try {
    // DELETE /api/admin/products/:id - Delete product (admin only)
    if (segments[0] === 'admin' && segments[1] === 'products' && segments.length === 3) {
      const { db } = await connectToDatabase()
      
      const result = await db.collection('products').deleteOne({ id: segments[2] })
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, message: 'Product deleted successfully' })
    }

    // DELETE /api/admin/coupons/:id - Delete coupon
    if (segments[0] === 'admin' && segments[1] === 'coupons' && segments.length === 3) {
      const { db } = await connectToDatabase()
      const couponId = segments[2]
      
      const result = await db.collection('coupons').deleteOne({ id: couponId })
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 })
      }
      
      // Also delete usage records for this coupon
      await db.collection('coupon_usage').deleteMany({ couponId })
      
      return NextResponse.json({ success: true, message: 'Coupon deleted successfully' })
    }

    // DELETE /api/users/addresses/:addressId - Delete address
    if (segments[0] === 'users' && segments[1] === 'addresses' && segments.length === 3) {
      const { searchParams } = new URL(request.url)
      const phone = searchParams.get('phone')
      const addressId = segments[2]
      
      if (!phone) {
        return NextResponse.json({ success: false, message: 'Phone is required' }, { status: 400 })
      }
      
      const { db } = await connectToDatabase()
      
      const result = await db.collection('users').updateOne(
        { phone },
        { $pull: { addresses: { id: addressId } } }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
      }
      
      const updatedUser = await db.collection('users').findOne({ phone })
      return NextResponse.json({ success: true, addresses: updatedUser.addresses })
    }

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
