const { MongoClient } = require('mongodb');

(async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URL);
    const db = client.db();
    
    // Get last 10 orders
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(10).toArray();
    
    console.log('Last 10 orders:');
    orders.forEach(order => {
      console.log('Order ID:', order.orderId, 'Affiliate Code:', order.affiliateCode || 'NONE', 'Created:', order.createdAt);
    });
    
    // Count orders with affiliate codes
    const withAffiliate = await db.collection('orders').countDocuments({ affiliateCode: { $ne: null, $exists: true } });
    const totalOrders = await db.collection('orders').countDocuments({});
    
    console.log('\nOrders with affiliate code:', withAffiliate);
    console.log('Total orders:', totalOrders);
    console.log('Orders without affiliate code:', totalOrders - withAffiliate);
    
    // Get all affiliates
    const affiliates = await db.collection('affiliates').find({}).toArray();
    console.log('\nTotal affiliates:', affiliates.length);
    
    affiliates.forEach(aff => {
      console.log('Affiliate:', aff.code, 'Name:', aff.name, 'Clicks:', aff.clicks || 0);
    });
    
    await client.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
