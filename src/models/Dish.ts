import mongoose, { Document, Schema } from 'mongoose';

export interface IDish extends Document {
  name: string;
  description: string;
  price: number;
  photoUrl?: string;
  category: string;
  partnerId: mongoose.Types.ObjectId;
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  allergens: string[];
  isFeatured: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  containsNuts: boolean;
  containsDairy: boolean;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  servingSize: string;
  ingredients: string[];
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  variants?: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
  addOns?: Array<{
    name: string;
    price: number;
    description?: string;
    isRequired: boolean;
  }>;
  availability: {
    days: string[];
    startTime?: string;
    endTime?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const dishSchema = new Schema<IDish>({
  name: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true,
    minlength: [2, 'Dish name must be at least 2 characters'],
    maxlength: [100, 'Dish name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Dish description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  photoUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: [true, 'Partner ID is required']
  },
  nutritionInfo: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative']
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative']
    },
    fat: {
      type: Number,
      min: [0, 'Fat cannot be negative']
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative']
    }
  },
  allergens: [{
    type: String,
    enum: ['nuts', 'dairy', 'eggs', 'soy', 'wheat', 'fish', 'shellfish', 'sesame']
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  containsNuts: {
    type: Boolean,
    default: false
  },
  containsDairy: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [5, 'Preparation time must be at least 5 minutes']
  },
  servingSize: {
    type: String,
    required: [true, 'Serving size is required']
  },
  ingredients: [{
    type: String,
    required: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  variants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Variant price cannot be negative']
    },
    description: String
  }],
  addOns: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Add-on price cannot be negative']
    },
    description: String,
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  availability: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    },
    endTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
dishSchema.index({ partnerId: 1 });
dishSchema.index({ category: 1 });
dishSchema.index({ isAvailable: 1 });
dishSchema.index({ isFeatured: 1 });
dishSchema.index({ isVegetarian: 1 });
dishSchema.index({ isVegan: 1 });
dishSchema.index({ price: 1 });
dishSchema.index({ 'rating.average': -1 });
dishSchema.index({ tags: 1 });

// Text index for search functionality
dishSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

export const Dish = mongoose.model<IDish>('Dish', dishSchema);