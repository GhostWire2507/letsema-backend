import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'partner' | 'admin' | 'driver';
  favourites: mongoose.Types.ObjectId[];
  cart: Array<{
    dishId: mongoose.Types.ObjectId;
    quantity: number;
    specialInstructions?: string;
    addedAt: Date;
  }>;
  profile: {
    phone?: string;
    avatar?: string;
    dateOfBirth?: Date;
    preferences: {
      dietary: string[];
      spiceLevel: 'mild' | 'medium' | 'hot';
      notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
      };
    };
  };
  addresses: Array<{
    _id?: mongoose.Types.ObjectId;
    label: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    isDefault: boolean;
  }>;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['customer', 'partner', 'admin', 'driver'],
    default: 'customer'
  },
  favourites: [{
    type: Schema.Types.ObjectId,
    ref: 'Dish'
  }],
  cart: [{
    dishId: {
      type: Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    specialInstructions: {
      type: String,
      maxlength: [200, 'Special instructions cannot exceed 200 characters']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  profile: {
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    avatar: String,
    dateOfBirth: Date,
    preferences: {
      dietary: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'dairy-free', 'nut-free']
      }],
      spiceLevel: {
        type: String,
        enum: ['mild', 'medium', 'hot'],
        default: 'medium'
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
      }
    }
  },
  addresses: [{
    label: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    province: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      return ret;
    }
  }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);