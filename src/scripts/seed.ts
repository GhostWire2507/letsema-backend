import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Partner } from '../models/Partner';
import { Dish } from '../models/Dish';
import { logger } from '../utils/logger';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Partner.deleteMany({});
    await Dish.deleteMany({});
    
    logger.info('Cleared existing data');

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@letsema.com',
      passwordHash: 'admin123',
      role: 'admin'
    });
    await admin.save();

    // Create partner user
    const partnerUser = new User({
      name: 'Partner User',
      email: 'partner@letsema.com',
      passwordHash: 'partner123',
      role: 'partner'
    });
    await partnerUser.save();

    // Create customer user
    const customer = new User({
      name: 'Customer User',
      email: 'customer@letsema.com',
      passwordHash: 'customer123',
      role: 'customer'
    });
    await customer.save();

    // Create driver user
    const driver = new User({
      name: 'Driver User',
      email: 'driver@letsema.com',
      passwordHash: 'driver123',
      role: 'driver'
    });
    await driver.save();

    logger.info('Created users');

    // Create partner
    const partner = new Partner({
      name: 'Mama\'s Kitchen',
      description: 'Authentic South African home cooking',
      logoUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      address: {
        street: '123 Main Street',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        coordinates: {
          lat: -33.9249,
          lng: 18.4241
        }
      },
      contact: {
        phone: '+27123456789',
        email: 'info@mamaskitchen.co.za',
        whatsapp: '+27123456789'
      },
      businessInfo: {
        businessType: 'home_kitchen',
        cuisineTypes: ['South African', 'Traditional'],
        operatingHours: [
          { day: 'monday', open: '08:00', close: '18:00', isOpen: true },
          { day: 'tuesday', open: '08:00', close: '18:00', isOpen: true },
          { day: 'wednesday', open: '08:00', close: '18:00', isOpen: true },
          { day: 'thursday', open: '08:00', close: '18:00', isOpen: true },
          { day: 'friday', open: '08:00', close: '18:00', isOpen: true },
          { day: 'saturday', open: '09:00', close: '16:00', isOpen: true },
          { day: 'sunday', open: '10:00', close: '15:00', isOpen: false }
        ]
      },
      status: 'active',
      rating: {
        average: 4.5,
        count: 25
      },
      deliveryInfo: {
        deliveryRadius: 10,
        deliveryFee: 25,
        minimumOrder: 50,
        estimatedDeliveryTime: 45
      },
      owner: partnerUser._id,
      isVerified: true,
      isFeatured: true
    });
    await partner.save();

    logger.info('Created partner');

    // Create dishes
    const dishes = [
      {
        name: 'Bobotie with Yellow Rice',
        description: 'Traditional South African spiced mince dish topped with egg custard, served with fragrant yellow rice',
        price: 85,
        photoUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        category: 'Main Course',
        partnerId: partner._id,
        isFeatured: true,
        isSpicy: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        containsNuts: true,
        containsDairy: true,
        preparationTime: 30,
        servingSize: '1 portion',
        ingredients: ['Beef mince', 'Onions', 'Curry powder', 'Almonds', 'Raisins', 'Bread', 'Milk', 'Eggs', 'Rice'],
        rating: { average: 4.7, count: 15 },
        tags: ['traditional', 'comfort food', 'south african']
      },
      {
        name: 'Bunny Chow (Chicken Curry)',
        description: 'Durban\'s famous street food - chicken curry served in a hollowed-out loaf of bread',
        price: 65,
        photoUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
        category: 'Street Food',
        partnerId: partner._id,
        isFeatured: true,
        isSpicy: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        containsNuts: false,
        containsDairy: false,
        preparationTime: 25,
        servingSize: '1 quarter loaf',
        ingredients: ['Chicken', 'Onions', 'Tomatoes', 'Curry powder', 'Garam masala', 'White bread'],
        rating: { average: 4.5, count: 22 },
        tags: ['spicy', 'street food', 'durban', 'curry']
      },
      {
        name: 'Boerewors Roll',
        description: 'Grilled traditional South African sausage in a fresh roll with tomato relish',
        price: 45,
        photoUrl: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
        category: 'Street Food',
        partnerId: partner._id,
        isFeatured: false,
        isSpicy: false,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        containsNuts: false,
        containsDairy: false,
        preparationTime: 15,
        servingSize: '1 roll',
        ingredients: ['Boerewors', 'Fresh roll', 'Tomato relish', 'Onions'],
        rating: { average: 4.3, count: 18 },
        tags: ['grilled', 'sausage', 'quick bite']
      },
      {
        name: 'Vetkoek with Mince',
        description: 'Deep-fried bread filled with spiced mince curry',
        price: 35,
        photoUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        category: 'Street Food',
        partnerId: partner._id,
        isFeatured: false,
        isSpicy: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        containsNuts: false,
        containsDairy: false,
        preparationTime: 20,
        servingSize: '1 vetkoek',
        ingredients: ['Flour', 'Yeast', 'Beef mince', 'Onions', 'Curry powder', 'Tomatoes'],
        rating: { average: 4.2, count: 12 },
        tags: ['fried', 'filling', 'comfort food']
      },
      {
        name: 'Malva Pudding',
        description: 'Traditional South African sponge pudding with apricot jam and custard',
        price: 40,
        photoUrl: 'https://images.pexels.com/photos/1126728/pexels-photo-1126728.jpeg',
        category: 'Dessert',
        partnerId: partner._id,
        isFeatured: false,
        isSpicy: false,
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        containsNuts: false,
        containsDairy: true,
        preparationTime: 35,
        servingSize: '1 portion',
        ingredients: ['Flour', 'Sugar', 'Eggs', 'Apricot jam', 'Butter', 'Milk', 'Cream'],
        rating: { average: 4.8, count: 20 },
        tags: ['dessert', 'sweet', 'traditional', 'warm']
      }
    ];

    for (const dishData of dishes) {
      const dish = new Dish(dishData);
      await dish.save();
      partner.dishes.push(dish._id);
    }

    await partner.save();

    logger.info('Created dishes');
    logger.info('Seed data created successfully!');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();