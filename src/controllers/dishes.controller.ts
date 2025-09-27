import { Request, Response } from 'express';
import { Dish } from '../models/Dish';
import { Partner } from '../models/Partner';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getDishes = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      partnerId,
      category,
      isVegetarian,
      isVegan,
      isSpicy,
      isFeatured,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query: any = { isAvailable: true };

    // Apply filters
    if (partnerId) {
      query.partnerId = partnerId;
    }

    if (category) {
      query.category = category;
    }

    if (isVegetarian !== undefined) {
      query.isVegetarian = isVegetarian === 'true';
    }

    if (isVegan !== undefined) {
      query.isVegan = isVegan === 'true';
    }

    if (isSpicy !== undefined) {
      query.isSpicy = isSpicy === 'true';
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj: any = {};
    
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    } else {
      sortObj[sort as string] = sortOrder;
    }

    const dishes = await Dish.find(query)
      .sort(sortObj)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('partnerId', 'name logoUrl rating deliveryInfo');

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
    logger.error('Get dishes error:', error);
    throw error;
  }
};

export const getDishById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findById(id)
      .populate('partnerId', 'name logoUrl rating deliveryInfo address contact');

    if (!dish) {
      throw createError('Dish not found', 404);
    }

    res.json({
      success: true,
      data: { dish }
    });
  } catch (error) {
    logger.error('Get dish error:', error);
    throw error;
  }
};

export const createDish = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const requestingUser = (req as AuthRequest).user;
    const dishData = req.body;

    // Check if partner exists
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      throw createError('Partner not found', 404);
    }

    // Check if user can create dishes for this partner
    if (partner.owner.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    // Set the partnerId
    dishData.partnerId = partnerId;

    const dish = new Dish(dishData);
    await dish.save();

    // Add dish to partner's dishes array
    partner.dishes.push(dish._id);
    await partner.save();

    const populatedDish = await Dish.findById(dish._id)
      .populate('partnerId', 'name logoUrl');

    logger.info(`New dish created: ${dish.name} for partner ${partner.name}`);

    res.status(201).json({
      success: true,
      message: 'Dish created successfully',
      data: { dish: populatedDish }
    });
  } catch (error) {
    logger.error('Create dish error:', error);
    throw error;
  }
};

export const updateDish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;
    const updates = req.body;

    const dish = await Dish.findById(id).populate('partnerId');
    if (!dish) {
      throw createError('Dish not found', 404);
    }

    const partner = dish.partnerId as any;

    // Check if user can update this dish
    if (partner.owner.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    const updatedDish = await Dish.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('partnerId', 'name logoUrl');

    res.json({
      success: true,
      message: 'Dish updated successfully',
      data: { dish: updatedDish }
    });
  } catch (error) {
    logger.error('Update dish error:', error);
    throw error;
  }
};

export const deleteDish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;

    const dish = await Dish.findById(id).populate('partnerId');
    if (!dish) {
      throw createError('Dish not found', 404);
    }

    const partner = dish.partnerId as any;

    // Check if user can delete this dish
    if (partner.owner.toString() !== requestingUser._id.toString() && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    // Soft delete by setting isAvailable to false
    dish.isAvailable = false;
    await dish.save();

    logger.info(`Dish deactivated: ${dish.name} by ${requestingUser.email}`);

    res.json({
      success: true,
      message: 'Dish deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete dish error:', error);
    throw error;
  }
};

export const getFeaturedDishes = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const dishes = await Dish.find({
      isFeatured: true,
      isAvailable: true
    })
      .limit(Number(limit))
      .sort({ 'rating.average': -1, createdAt: -1 })
      .populate('partnerId', 'name logoUrl rating');

    res.json({
      success: true,
      data: { dishes }
    });
  } catch (error) {
    logger.error('Get featured dishes error:', error);
    throw error;
  }
};

export const getDishesByCategory = async (req: Request, res: Response) => {
  try {
    const categories = await Dish.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          dishes: {
            $push: {
              _id: '$_id',
              name: '$name',
              price: '$price',
              photoUrl: '$photoUrl',
              rating: '$rating'
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    logger.error('Get dishes by category error:', error);
    throw error;
  }
};