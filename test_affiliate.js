require('dotenv').config();
const { MongoClient } = require('mongodb');

async function checkAffiliateOrders() {
  const client = new MongoClient(process.env.MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Get recent orders
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(5).toArray();
    
    console.log('=== Recent Orders ===');
    orders.forEach((order, i) => {
      console.log(`${i + 1}. Order: ${order.orderId}`);
      console.log(`   Affiliate: ${order.affiliateCode || 'NONE'}`);
      console.log(`   Date: ${order.createdAt}`);
      console.log('');
    });
    
    // Check orders with affiliates
    const affiliateOrders = await db.collection('orders').find({ 
      affiliateCode: { $exists: true, $ne: null, $ne: '' } 
    }).toArray();
    
    console.log(`Total orders with affiliate codes: ${affiliateOrders.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkAffiliateOrders();
