import mongoose, { Document, Schema } from 'mongoose';

export interface IPartner extends Document {
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  businessInfo: {
    registrationNumber?: string;
    taxNumber?: string;
    businessType: 'restaurant' | 'home_kitchen' | 'catering' | 'food_truck';
    cuisineTypes: string[];
    operatingHours: Array<{
      day: string;
      open: string;
      close: string;
      isOpen: boolean;
    }>;
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: {
    average: number;
    count: number;
  };
  deliveryInfo: {
    deliveryRadius: number; // in kilometers
    deliveryFee: number;
    minimumOrder: number;
    estimatedDeliveryTime: number; // in minutes
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
  };
  documents: Array<{
    type: 'business_license' | 'food_safety_certificate' | 'tax_certificate' | 'id_document';
    url: string;
    verified: boolean;
    uploadedAt: Date;
  }>;
  owner: mongoose.Types.ObjectId;
  dishes: mongoose.Types.ObjectId[];
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const partnerSchema = new Schema<IPartner>({
  name: {
    type: String,
    required: [true, 'Partner name is required'],
    trim: true,
    minlength: [2, 'Partner name must be at least 2 characters'],
    maxlength: [100, 'Partner name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logoUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  bannerUrl: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    whatsapp: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid WhatsApp number']
    }
  },
  businessInfo: {
    registrationNumber: String,
    taxNumber: String,
    businessType: {
      type: String,
      enum: ['restaurant', 'home_kitchen', 'catering', 'food_truck'],
      required: [true, 'Business type is required']
    },
    cuisineTypes: [{
      type: String,
      required: true
    }],
    operatingHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
      },
      open: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
      },
      close: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
      },
      isOpen: {
        type: Boolean,
        default: true
      }
    }]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
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
  deliveryInfo: {
    deliveryRadius: {
      type: Number,
      required: [true, 'Delivery radius is required'],
      min: [1, 'Delivery radius must be at least 1 km']
    },
    deliveryFee: {
      type: Number,
      required: [true, 'Delivery fee is required'],
      min: [0, 'Delivery fee cannot be negative']
    },
    minimumOrder: {
      type: Number,
      required: [true, 'Minimum order amount is required'],
      min: [0, 'Minimum order cannot be negative']
    },
    estimatedDeliveryTime: {
      type: Number,
      required: [true, 'Estimated delivery time is required'],
      min: [10, 'Delivery time must be at least 10 minutes']
    }
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchCode: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['business_license', 'food_safety_certificate', 'tax_certificate', 'id_document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Partner owner is required']
  },
  dishes: [{
    type: Schema.Types.ObjectId,
    ref: 'Dish'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
partnerSchema.index({ status: 1 });
partnerSchema.index({ 'address.city': 1 });
partnerSchema.index({ 'businessInfo.cuisineTypes': 1 });
partnerSchema.index({ 'rating.average': -1 });
partnerSchema.index({ isFeatured: 1 });
partnerSchema.index({ owner: 1 });

export const Partner = mongoose.model<IPartner>('Partner', partnerSchema);