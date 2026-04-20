const { MongoClient } = require('mongodb');

async function updateOrders() {
  const client = new MongoClient('mongodb+srv://hardik:hardik18@begood-cluster.jgdzut4.mongodb.net/?appName=BeGood-cluster');
  
  try {
    await client.connect();
    const db = client.db();
    
    // Order IDs from the screenshot
    const orderIds = [
      '1768192d',
      '0c031ed0',
      '570a1bae',
      '8e6dafd6',
      'c632d36f',
      '1f06c979',
      'c5881da7',
      '964e7586',
      '359f841e'
    ];
    
    console.log('Updating orders with SAH affiliate code...\n');
    
    // Update each order
    for (const orderId of orderIds) {
      const result = await db.collection('orders').updateOne(
        { orderId: { $regex: `^${orderId}`, $options: 'i' } },
        { $set: { affiliateCode: 'SAH' } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated order ${orderId}`);
      } else {
        console.log(`⚠️  Order ${orderId} not found or already updated`);
      }
    }
    
    // Count total orders with SAH code
    const sahOrders = await db.collection('orders').find({ affiliateCode: 'SAH' }).toArray();
    console.log(`\n✅ Total orders with SAH code: ${sahOrders.length}`);
    
    // Calculate total revenue for SAH
    let totalRevenue = 0;
    sahOrders.forEach(order => {
      totalRevenue += order.totalAmount || 0;
    });
    console.log(`💰 Total revenue from SAH: ₹${totalRevenue}`);
    
    // Update affiliate stats
    const affiliate = await db.collection('affiliates').findOne({ code: 'SAH' });
    
    if (affiliate) {
      await db.collection('affiliates').updateOne(
        { code: 'SAH' },
        { 
          $set: { 
            totalOrders: sahOrders.length,
            totalRevenue: totalRevenue
          }
        }
      );
      console.log('\n✅ Updated SAH affiliate stats');
    } else {
      console.log('\n⚠️  SAH affiliate not found in database');
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateOrders();
