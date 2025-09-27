import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  partnerId: mongoose.Types.ObjectId;
  items: Array<{
    dishId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
    variants?: Array<{
      name: string;
      price: number;
    }>;
    addOns?: Array<{
      name: string;
      price: number;
    }>;
  }>;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
  };
  deliveryAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    instructions?: string;
  };
  paymentMethod: 'cash' | 'card' | 'ewallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  timeline: Array<{
    status: string;
    timestamp: Date;
    note?: string;
  }>;
  assignedDriverId?: mongoose.Types.ObjectId;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  specialInstructions?: string;
  rating?: {
    food: number;
    delivery: number;
    overall: number;
    comment?: string;
    ratedAt: Date;
  };
  cancellation?: {
    reason: string;
    cancelledBy: 'customer' | 'partner' | 'admin' | 'system';
    cancelledAt: Date;
    refundAmount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'Partner',
    required: [true, 'Partner ID is required']
  },
  items: [{
    dishId: {
      type: Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Item price cannot be negative']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    specialInstructions: String,
    variants: [{
      name: String,
      price: {
        type: Number,
        min: [0, 'Variant price cannot be negative']
      }
    }],
    addOns: [{
      name: String,
      price: {
        type: Number,
        min: [0, 'Add-on price cannot be negative']
      }
    }]
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: [0, 'Delivery fee cannot be negative']
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: [0, 'Service fee cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  deliveryAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    instructions: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'ewallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  assignedDriverId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  },
  rating: {
    food: {
      type: Number,
      min: [1, 'Food rating must be between 1 and 5'],
      max: [5, 'Food rating must be between 1 and 5']
    },
    delivery: {
      type: Number,
      min: [1, 'Delivery rating must be between 1 and 5'],
      max: [5, 'Delivery rating must be between 1 and 5']
    },
    overall: {
      type: Number,
      min: [1, 'Overall rating must be between 1 and 5'],
      max: [5, 'Overall rating must be between 1 and 5']
    },
    comment: String,
    ratedAt: Date
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['customer', 'partner', 'admin', 'system']
    },
    cancelledAt: Date,
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ customerId: 1 });
orderSchema.index({ partnerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ assignedDriverId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `LS${timestamp.slice(-6)}${random}`;
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);