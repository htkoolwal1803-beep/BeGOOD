# MongoDB Data Management Guide

Complete guide to viewing, backing up, and managing your BeGood customer data.

---

## Method 1: Using MongoDB Compass (GUI - Recommended for Beginners)

### Installation

1. **Download MongoDB Compass:**
   - Visit: https://www.mongodb.com/try/download/compass
   - Choose your operating system
   - Install (it's free)

### Connect to Your Database

**For Local MongoDB:**
```
mongodb://localhost:27017/begood
```

**For MongoDB Atlas (Cloud):**
```
mongodb+srv://begood_admin:YOUR_PASSWORD@begood-cluster.xxxxx.mongodb.net/begood
```

### View Your Data

1. Open MongoDB Compass
2. Paste connection string
3. Click **Connect**
4. You'll see your database: `begood`
5. Click on `begood` to see all collections

**Collections Overview:**
- **orders** - All customer orders
- **analytics** - Website analytics events
- **notifications** - P-Bar email signups
- **reviews** - Customer reviews
- **products** - Product catalog

### Explore Data

1. Click on any collection (e.g., `orders`)
2. You'll see all documents in a nice table view
3. Click on any document to see full details
4. Use **Filter** to search (e.g., `{ email: "customer@example.com" }`)
5. Use **Sort** to order data (e.g., `{ createdAt: -1 }` for newest first)

### Export Data

**Export Single Collection:**
1. Select collection (e.g., `orders`)
2. Click **Export Collection** (top right)
3. Choose format: JSON or CSV
4. Click **Export**
5. Save file to your computer

**Export Specific Data:**
1. Use Filter to find what you want (e.g., orders from last month)
2. Click **Export** 
3. Only filtered results will be exported

---

## Method 2: Using Command Line (Advanced)

### View Data

```bash
# Connect to local MongoDB
mongosh mongodb://localhost:27017/begood

# View all collections
show collections

# View all orders
db.orders.find().pretty()

# View latest 10 orders
db.orders.find().sort({ createdAt: -1 }).limit(10).pretty()

# Search by email
db.orders.find({ email: "customer@example.com" }).pretty()

# Count total orders
db.orders.countDocuments()

# View all P-Bar signups
db.notifications.find().pretty()

# View analytics
db.analytics.find().sort({ timestamp: -1 }).limit(50).pretty()

# Exit
exit
```

### Export Data (Backup)

**Backup Entire Database:**
```bash
# Create backup directory
mkdir -p ~/begood-backups

# Backup everything
mongodump --uri="mongodb://localhost:27017/begood" --out=~/begood-backups/backup-$(date +%Y%m%d)

# You'll see:
# - backup-20260106/
#   - begood/
#     - orders.bson
#     - analytics.bson
#     - notifications.bson
#     - etc.
```

**Backup Single Collection:**
```bash
# Backup only orders
mongodump --uri="mongodb://localhost:27017/begood" --collection=orders --out=~/begood-backups/orders-backup
```

**Export to JSON (Human Readable):**
```bash
# Export orders as JSON
mongoexport --uri="mongodb://localhost:27017/begood" --collection=orders --out=~/begood-backups/orders.json --jsonArray

# Export as CSV
mongoexport --uri="mongodb://localhost:27017/begood" --collection=orders --type=csv --fields=customerName,email,phone,totalAmount,status,createdAt --out=~/begood-backups/orders.csv
```

### Restore Data

**Restore Entire Database:**
```bash
# Restore from backup
mongorestore --uri="mongodb://localhost:27017/begood" ~/begood-backups/backup-20260106/begood/
```

**Restore Single Collection:**
```bash
# Restore orders collection
mongorestore --uri="mongodb://localhost:27017/begood" --collection=orders ~/begood-backups/backup-20260106/begood/orders.bson
```

---

## Method 3: Using MongoDB Atlas Web UI (For Cloud Database)

### Access Atlas Dashboard

1. Go to https://cloud.mongodb.com
2. Login to your account
3. Select your cluster

### Browse Collections

1. Click **Browse Collections**
2. Select database: `begood`
3. Choose collection: `orders`
4. View all documents in web interface
5. Click any document to see details
6. Use **Filter** to search
7. Click **Edit Document** to modify (be careful!)

### Export from Atlas

1. Browse to collection
2. Click **Export** (top right)
3. Choose JSON or CSV
4. Download file

---

## Automated Backups

### Daily Backup Script

Create a backup script:

```bash
# Create script
cat > ~/backup-begood.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/begood-backups/daily
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mongodump --uri="mongodb://localhost:27017/begood" --out=$BACKUP_DIR/backup-$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/backup-$DATE"
EOF

# Make executable
chmod +x ~/backup-begood.sh

# Test it
~/backup-begood.sh
```

### Schedule Automated Backups

**Using Cron (Linux/Mac):**
```bash
# Open crontab
crontab -e

# Add this line to backup every day at 2 AM
0 2 * * * ~/backup-begood.sh

# Or backup every 6 hours
0 */6 * * * ~/backup-begood.sh
```

---

## Common Queries for Your Data

### Customer Analytics

**Total Customers:**
```javascript
db.orders.distinct("email").length
```

**Total Revenue:**
```javascript
db.orders.aggregate([
  { $group: { _id: null, total: { $sum: "$totalAmount" } } }
])
```

**Orders by Status:**
```javascript
db.orders.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

**Top Customers by Order Value:**
```javascript
db.orders.aggregate([
  { $group: { 
      _id: "$email", 
      totalSpent: { $sum: "$totalAmount" },
      orderCount: { $sum: 1 }
  }},
  { $sort: { totalSpent: -1 } },
  { $limit: 10 }
])
```

**Orders by Location:**
```javascript
db.orders.aggregate([
  { $group: { _id: "$pincode", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

**Recent Orders (Last 7 Days):**
```javascript
db.orders.find({
  createdAt: {
    $gte: new Date(Date.now() - 7*24*60*60*1000).toISOString()
  }
}).sort({ createdAt: -1 })
```

### P-Bar Interest

**Total P-Bar Signups:**
```javascript
db.notifications.countDocuments()
```

**Recent Signups:**
```javascript
db.notifications.find().sort({ createdAt: -1 }).limit(20)
```

### Analytics

**Most Viewed Pages:**
```javascript
db.analytics.aggregate([
  { $match: { event: "page_view" } },
  { $group: { _id: "$params.page", views: { $sum: 1 } } },
  { $sort: { views: -1 } }
])
```

**Conversion Funnel:**
```javascript
db.analytics.aggregate([
  { $group: { _id: "$event", count: { $sum: 1 } } }
])
```

---

## Backup to Cloud (Google Drive / Dropbox)

### Using rclone (Recommended)

1. **Install rclone:**
   ```bash
   curl https://rclone.org/install.sh | sudo bash
   ```

2. **Configure Google Drive:**
   ```bash
   rclone config
   # Follow prompts to connect Google Drive
   # Name it: "gdrive"
   ```

3. **Backup Script with Cloud Upload:**
   ```bash
   cat > ~/backup-to-cloud.sh << 'EOF'
   #!/bin/bash
   DATE=$(date +%Y%m%d)
   BACKUP_DIR=~/begood-backups
   
   # Create backup
   mongodump --uri="mongodb://localhost:27017/begood" --out=$BACKUP_DIR/backup-$DATE
   
   # Compress
   cd $BACKUP_DIR
   tar -czf backup-$DATE.tar.gz backup-$DATE/
   
   # Upload to Google Drive
   rclone copy backup-$DATE.tar.gz gdrive:BeGoodBackups/
   
   # Cleanup local backup (keep compressed only)
   rm -rf backup-$DATE/
   
   echo "Backup uploaded to Google Drive"
   EOF
   
   chmod +x ~/backup-to-cloud.sh
   ```

---

## Security Best Practices

### Protect Your Backups

1. **Encrypt Backups:**
   ```bash
   # Backup and encrypt
   mongodump --uri="mongodb://localhost:27017/begood" --archive | gpg --symmetric --cipher-algo AES256 > backup.mongodump.gpg
   
   # Restore from encrypted backup
   gpg --decrypt backup.mongodump.gpg | mongorestore --archive
   ```

2. **Store Backups Securely:**
   - Don't leave backups in public folders
   - Use cloud storage with encryption
   - Keep offline backup on external drive

3. **Regular Testing:**
   - Test restoring backups monthly
   - Make sure data is recoverable

### Access Control

1. **For Production (Atlas):**
   - Create separate read-only user for analytics
   - Never share admin credentials
   - Rotate passwords quarterly

2. **For Local Development:**
   - Keep MongoDB behind firewall
   - Don't expose port 27017 to internet

---

## Data Retention Policy

### What to Keep:

**Forever:**
- All orders (legal requirement)
- Customer information (for support)
- Payment records

**1 Year:**
- Analytics data (aggregate after 1 year)
- Failed payment attempts

**30 Days:**
- Cart abandonment data
- Session data

### Cleanup Old Analytics:

```javascript
// Delete analytics older than 90 days
db.analytics.deleteMany({
  timestamp: {
    $lt: new Date(Date.now() - 90*24*60*60*1000).toISOString()
  }
})
```

---

## Quick Reference Commands

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/begood

# Backup database
mongodump --uri="mongodb://localhost:27017/begood" --out=~/backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/begood" ~/backup/begood/

# Export orders to CSV
mongoexport --uri="mongodb://localhost:27017/begood" --collection=orders --type=csv --fields=customerName,email,totalAmount,createdAt --out=orders.csv

# View recent orders
mongosh mongodb://localhost:27017/begood --eval "db.orders.find().sort({createdAt:-1}).limit(5)"

# Count total orders
mongosh mongodb://localhost:27017/begood --eval "db.orders.countDocuments()"
```

---

## Monitoring & Alerts

### Set Up MongoDB Atlas Alerts (If using cloud):

1. Go to Atlas Dashboard → Alerts
2. Create alert for:
   - Database storage > 80%
   - Connection errors
   - Slow queries
3. Get email notifications

### Simple Monitoring Script:

```bash
# Create monitoring script
cat > ~/monitor-begood.sh << 'EOF'
#!/bin/bash
ORDERS_COUNT=$(mongosh mongodb://localhost:27017/begood --quiet --eval "db.orders.countDocuments()")
echo "Total Orders: $ORDERS_COUNT"

TODAYS_ORDERS=$(mongosh mongodb://localhost:27017/begood --quiet --eval "db.orders.countDocuments({createdAt: {\$gte: new Date(new Date().setHours(0,0,0,0)).toISOString()}})")
echo "Today's Orders: $TODAYS_ORDERS"

REVENUE=$(mongosh mongodb://localhost:27017/begood --quiet --eval "db.orders.aggregate([{\$group: {_id: null, total: {\$sum: '\$totalAmount'}}}]).toArray()[0].total")
echo "Total Revenue: ₹$REVENUE"
EOF

chmod +x ~/monitor-begood.sh
~/monitor-begood.sh
```

---

**Pro Tip:** Set up MongoDB Compass on your computer for easy visual access to all your data! It's much easier than command line for daily tasks. 🚀
