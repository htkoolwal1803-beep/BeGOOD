import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

// MongoDB connection
let cachedClient = null
let cachedDb = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = await MongoClient.connect(process.env.MONGO_URL)

  const db = client.db()
  cachedClient = client
  cachedDb = db

  return { client, db }
}

// Helper to extract path segments
function getPathSegments(pathname) {
  return pathname.replace('/api/', '').split('/').filter(Boolean)
}

export async function GET(request) {
  const pathname = request.nextUrl.pathname
  const segments = getPathSegments(pathname)

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
      const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray()
      
      return NextResponse.json({ success: true, orders })
    }

    // GET /api/admin/analytics
    if (segments[0] === 'admin' && segments[1] === 'analytics') {
      const { db } = await connectToDatabase()
      
      // Get orders for revenue calculation
      const orders = await db.collection('orders').find({}).toArray()
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      
      // Get analytics events
      const events = await db.collection('analytics').find({}).toArray()
      
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
      const reviews = await db.collection('reviews').find({}).sort({ date: -1 }).toArray()
      
      return NextResponse.json({ success: true, reviews })
    }

    // GET /api/admin/notifications - Get all notification signups
    if (segments[0] === 'admin' && segments[1] === 'notifications') {
      const { db } = await connectToDatabase()
      const notifications = await db.collection('notifications').find({}).sort({ createdAt: -1 }).toArray()
      
      return NextResponse.json({ success: true, notifications })
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

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const pathname = request.nextUrl.pathname
  const segments = getPathSegments(pathname)

  try {
    // POST /api/orders - Create new order
    if (segments[0] === 'orders' && segments.length === 1) {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const order = {
        orderId: uuidv4(),
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        pincode: body.pincode,
        products: body.products,
        totalAmount: body.totalAmount,
        status: 'Pending',
        paymentId: body.paymentId || null,
        createdAt: new Date().toISOString()
      }
      
      await db.collection('orders').insertOne(order)
      
      // Track order completion in analytics
      await db.collection('analytics').insertOne({
        event: 'order_completed',
        params: {
          orderId: order.orderId,
          amount: order.totalAmount
        },
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')
      })
      
      return NextResponse.json({ success: true, order })
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

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  const pathname = request.nextUrl.pathname
  const segments = getPathSegments(pathname)

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

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
