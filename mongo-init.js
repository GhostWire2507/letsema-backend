// MongoDB initialization script
db = db.getSiblingDB('letsema');

// Create collections
db.createCollection('users');
db.createCollection('partners');
db.createCollection('dishes');
db.createCollection('orders');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

db.partners.createIndex({ "status": 1 });
db.partners.createIndex({ "address.city": 1 });
db.partners.createIndex({ "businessInfo.cuisineTypes": 1 });
db.partners.createIndex({ "rating.average": -1 });
db.partners.createIndex({ "owner": 1 });

db.dishes.createIndex({ "partnerId": 1 });
db.dishes.createIndex({ "category": 1 });
db.dishes.createIndex({ "isAvailable": 1 });
db.dishes.createIndex({ "isFeatured": 1 });
db.dishes.createIndex({ "price": 1 });
db.dishes.createIndex({ "rating.average": -1 });

db.orders.createIndex({ "customerId": 1 });
db.orders.createIndex({ "partnerId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });

print('Database initialized successfully!');