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

    // POST /api/users/update - Update user profile
    if (segments[0] === 'users' && segments[1] === 'update') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { phone, name, email, age } = body
      
      if (!phone) {
        return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 })
      }
      
      const updateFields = { updatedAt: new Date().toISOString() }
      if (name !== undefined) updateFields.name = name
      if (email !== undefined) updateFields.email = email
      if (age !== undefined) updateFields.age = age
      
      const result = await db.collection('users').updateOne(
        { phone },
        { $set: updateFields }
      )
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
      }
      
      const updatedUser = await db.collection('users').findOne({ phone })
      return NextResponse.json({ success: true, user: updatedUser })
    }

    // POST /api/users/addresses - Add new address
    if (segments[0] === 'users' && segments[1] === 'addresses') {
      const body = await request.json()
      const { db } = await connectToDatabase()
      
      const { phone, address } = body
      
      if (!phone || !address) {
        return NextResponse.json({ success: false, message: 'Phone and address are required' }, { status: 400 })
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

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  const pathname = request.nextUrl.pathname
  const segments = getPathSegments(pathname)

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

    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
