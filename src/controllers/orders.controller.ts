import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Dish } from '../models/Dish';
import { Partner } from '../models/Partner';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const requestingUser = (req as AuthRequest).user;
    const { items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Validate items and calculate pricing
    let subtotal = 0;
    let partnerId: string | null = null;
    const orderItems = [];

    for (const item of items) {
      const dish = await Dish.findById(item.dishId).populate('partnerId');
      if (!dish) {
        throw createError(`Dish with ID ${item.dishId} not found`, 404);
      }

      if (!dish.isAvailable) {
        throw createError(`Dish "${dish.name}" is not available`, 400);
      }

      // Ensure all items are from the same partner
      if (!partnerId) {
        partnerId = dish.partnerId._id.toString();
      } else if (partnerId !== dish.partnerId._id.toString()) {
        throw createError('All items must be from the same partner', 400);
      }

      const itemTotal = dish.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    }

    // Get partner for delivery fee and minimum order
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      throw createError('Partner not found', 404);
    }

    if (subtotal < partner.deliveryInfo.minimumOrder) {
      throw createError(
        `Minimum order amount is R${partner.deliveryInfo.minimumOrder}`,
        400
      );
    }

    const deliveryFee = partner.deliveryInfo.deliveryFee;
    const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
    const tax = Math.round((subtotal + serviceFee) * 0.15); // 15% VAT
    const total = subtotal + deliveryFee + serviceFee + tax;

    // Create order
    const order = new Order({
      customerId: requestingUser._id,
      partnerId,
      items: orderItems,
      pricing: {
        subtotal,
        deliveryFee,
        serviceFee,
        tax,
        discount: 0,
        total
      },
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      estimatedDeliveryTime: new Date(
        Date.now() + partner.deliveryInfo.estimatedDeliveryTime * 60000
      ),
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed'
      }]
    });

    await order.save();

    // Clear user's cart
    await User.findByIdAndUpdate(requestingUser._id, { $set: { cart: [] } });

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email profile.phone')
      .populate('partnerId', 'name logoUrl contact')
      .populate('items.dishId', 'name photoUrl');

    logger.info(`New order created: ${order.orderNumber} by ${requestingUser.email}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    logger.error('Create order error:', error);
    throw error;
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;

    const order = await Order.findById(id)
      .populate('customerId', 'name email profile.phone')
      .populate('partnerId', 'name logoUrl contact')
      .populate('assignedDriverId', 'name profile.phone')
      .populate('items.dishId', 'name photoUrl');

    if (!order) {
      throw createError('Order not found', 404);
    }

    // Check if user can access this order
    const canAccess = 
      order.customerId._id.toString() === requestingUser._id.toString() ||
      requestingUser.role === 'admin' ||
      (requestingUser.role === 'partner' && await Partner.findOne({ 
        _id: order.partnerId, 
        owner: requestingUser._id 
      })) ||
      (requestingUser.role === 'driver' && order.assignedDriverId?.toString() === requestingUser._id.toString());

    if (!canAccess) {
      throw createError('Access denied', 403);
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    logger.error('Get order error:', error);
    throw error;
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const requestingUser = (req as AuthRequest).user;
    const {
      page = 1,
      limit = 10,
      status,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query: any = { customerId: requestingUser._id };

    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj: any = {};
    sortObj[sort as string] = sortOrder;

    const orders = await Order.find(query)
      .sort(sortObj)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('partnerId', 'name logoUrl')
      .populate('assignedDriverId', 'name profile.phone');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get user orders error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const requestingUser = (req as AuthRequest).user;

    const order = await Order.findById(id);
    if (!order) {
      throw createError('Order not found', 404);
    }

    // Check if user can update this order
    const partner = await Partner.findOne({ 
      _id: order.partnerId, 
      owner: requestingUser._id 
    });

    const canUpdate = 
      requestingUser.role === 'admin' ||
      partner ||
      (requestingUser.role === 'driver' && order.assignedDriverId?.toString() === requestingUser._id.toString());

    if (!canUpdate) {
      throw createError('Access denied', 403);
    }

    // Update order status
    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      note
    });

    // Set delivery time if delivered
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('customerId', 'name email profile.phone')
      .populate('partnerId', 'name logoUrl contact')
      .populate('assignedDriverId', 'name profile.phone');

    logger.info(`Order ${order.orderNumber} status updated to ${status} by ${requestingUser.email}`);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    throw error;
  }
};

export const assignDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    const requestingUser = (req as AuthRequest).user;

    const order = await Order.findById(id);
    if (!order) {
      throw createError('Order not found', 404);
    }

    // Check if user can assign driver
    const partner = await Partner.findOne({ 
      _id: order.partnerId, 
      owner: requestingUser._id 
    });

    if (!partner && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    // Verify driver exists and has driver role
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      throw createError('Invalid driver', 400);
    }

    order.assignedDriverId = driverId;
    order.timeline.push({
      status: 'driver_assigned',
      timestamp: new Date(),
      note: `Driver ${driver.name} assigned`
    });

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('customerId', 'name email profile.phone')
      .populate('partnerId', 'name logoUrl contact')
      .populate('assignedDriverId', 'name profile.phone');

    logger.info(`Driver ${driver.name} assigned to order ${order.orderNumber}`);

    res.json({
      success: true,
      message: 'Driver assigned successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    logger.error('Assign driver error:', error);
    throw error;
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const requestingUser = (req as AuthRequest).user;

    const order = await Order.findById(id);
    if (!order) {
      throw createError('Order not found', 404);
    }

    // Check if user can cancel this order
    const canCancel = 
      order.customerId.toString() === requestingUser._id.toString() ||
      requestingUser.role === 'admin' ||
      await Partner.findOne({ _id: order.partnerId, owner: requestingUser._id });

    if (!canCancel) {
      throw createError('Access denied', 403);
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      throw createError('Order cannot be cancelled', 400);
    }

    order.status = 'cancelled';
    order.cancellation = {
      reason,
      cancelledBy: requestingUser.role,
      cancelledAt: new Date()
    };
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Order cancelled: ${reason}`
    });

    await order.save();

    logger.info(`Order ${order.orderNumber} cancelled by ${requestingUser.email}`);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    logger.error('Cancel order error:', error);
    throw error;
  }
};