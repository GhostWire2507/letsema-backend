import { Request, Response } from 'express';
import { Partner } from '../models/Partner';
import { Dish } from '../models/Dish';
import { Order } from '../models/Order';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getPartners = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      city,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query: any = {};

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (city) {
      query['address.city'] = new RegExp(city as string, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { 'businessInfo.cuisineTypes': new RegExp(search as string, 'i') }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj: any = {};
    sortObj[sort as string] = sortOrder;

    const partners = await Partner.find(query)
      .sort(sortObj)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('owner', 'name email')
      .select('-bankDetails -documents');

    const total = await Partner.countDocuments(query);

    res.json({
      success: true,
      data: {
        partners,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get partners error:', error);
    throw error;
  }
};

export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findById(id)
      .populate('owner', 'name email')
      .select('-bankDetails -documents');

    if (!partner) {
      throw createError('Partner not found', 404);
    }

    res.json({
      success: true,
      data: { partner }
    });
  } catch (error) {
    logger.error('Get partner error:', error);
    throw error;
  }
};

export const createPartner = async (req: Request, res: Response) => {
  try {
    const requestingUser = (req as AuthRequest).user;
    const partnerData = req.body;

    // Set the owner to the requesting user
    partnerData.owner = requestingUser._id;

    const partner = new Partner(partnerData);
    await partner.save();

    const populatedPartner = await Partner.findById(partner._id)
      .populate('owner', 'name email');

    logger.info(`New partner created: ${partner.name} by ${requestingUser.email}`);

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: { partner: populatedPartner }
    });
  } catch (error) {
    logger.error('Create partner error:', error);
    throw error;
  }
};

export const updatePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;
    const updates = req.body;

    const partner = await Partner.findById(id);
    if (!partner) {
      throw createError('Partner not found', 404);
    }

    // Check if user can update this partner
    if (partner.owner.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    // Remove sensitive fields that only admin can update
    if (requestingUser.role !== 'admin') {
      delete updates.status;
      delete updates.isVerified;
      delete updates.isFeatured;
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      success: true,
      message: 'Partner updated successfully',
      data: { partner: updatedPartner }
    });
  } catch (error) {
    logger.error('Update partner error:', error);
    throw error;
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;

    const partner = await Partner.findById(id);
    if (!partner) {
      throw createError('Partner not found', 404);
    }

    // Check if user can delete this partner
    if (partner.owner.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    // Soft delete by setting status to inactive
    partner.status = 'inactive';
    await partner.save();

    logger.info(`Partner deactivated: ${partner.name} by ${requestingUser.email}`);

    res.json({
      success: true,
      message: 'Partner deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete partner error:', error);
    throw error;
  }
};

export const getPartnerDishes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      category,
      isAvailable,
      isFeatured,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const partner = await Partner.findById(id);
    if (!partner) {
      throw createError('Partner not found', 404);
    }

    const query: any = { partnerId: id };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj: any = {};
    sortObj[sort as string] = sortOrder;

    const dishes = await Dish.find(query)
      .sort(sortObj)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('partnerId', 'name logoUrl');

    const total = await Dish.countDocuments(query);

    res.json({
      success: true,
      data: {
        dishes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get partner dishes error:', error);
    throw error;
  }
};

export const getPartnerOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;
    const {
      page = 1,
      limit = 10,
      status,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const partner = await Partner.findById(id);
    if (!partner) {
      throw createError('Partner not found', 404);
    }

    // Check if user can access partner orders
    if (partner.owner.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    const query: any = { partnerId: id };

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
      .populate('customerId', 'name email profile.phone')
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
    logger.error('Get partner orders error:', error);
    throw error;
  }
};