import Joi from 'joi';

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('customer', 'partner', 'admin', 'driver').default('customer')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Partner validation schemas
export const createPartnerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500),
  logoUrl: Joi.string().uri().optional(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    postalCode: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).optional()
  }).required(),
  contact: Joi.object({
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    whatsapp: Joi.string().optional()
  }).required(),
  status: Joi.string().valid('active', 'inactive', 'pending').default('pending')
});

// Dish validation schemas
export const createDishSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).required(),
  price: Joi.number().positive().required(),
  photoUrl: Joi.string().uri().optional(),
  category: Joi.string().required(),
  isFeatured: Joi.boolean().default(false),
  isSpicy: Joi.boolean().default(false),
  isVegetarian: Joi.boolean().default(false),
  containsNuts: Joi.boolean().default(false),
  containsDairy: Joi.boolean().default(false),
  isAvailable: Joi.boolean().default(true),
  preparationTime: Joi.number().positive().default(30)
});

// Order validation schemas
export const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      dishId: Joi.string().hex().length(24).required(),
      quantity: Joi.number().positive().required(),
      specialInstructions: Joi.string().max(200).optional()
    })
  ).min(1).required(),
  deliveryAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    postalCode: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).optional()
  }).required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'ewallet').required(),
  specialInstructions: Joi.string().max(500).optional()
});

// Cart validation schemas
export const addToCartSchema = Joi.object({
  dishId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().positive().required(),
  specialInstructions: Joi.string().max(200).optional()
});

// Favourites validation schemas
export const addToFavouritesSchema = Joi.object({
  dishId: Joi.string().hex().length(24).required()
});

// Query validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().positive().default(1),
  limit: Joi.number().positive().max(100).default(10),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

export const partnerQuerySchema = paginationSchema.keys({
  status: Joi.string().valid('active', 'inactive', 'pending').optional(),
  city: Joi.string().optional(),
  search: Joi.string().optional()
});

export const dishQuerySchema = paginationSchema.keys({
  partnerId: Joi.string().hex().length(24).optional(),
  category: Joi.string().optional(),
  isVegetarian: Joi.boolean().optional(),
  isSpicy: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  search: Joi.string().optional()
});