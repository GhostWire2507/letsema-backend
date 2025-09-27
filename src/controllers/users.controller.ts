import { Request, Response } from 'express';
import { User } from '../models/User';
import { Dish } from '../models/Dish';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;

    // Check if user can access this profile
    if (requestingUser._id.toString() !== id && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    throw error;
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;
    const updates = req.body;

    // Check if user can update this profile
    if (requestingUser._id.toString() !== id && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.passwordHash;
    delete updates.role;
    delete updates.isActive;
    delete updates.emailVerified;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    throw error;
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;

    // Only admin can delete users
    if (requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw createError('User not found', 404);
    }

    logger.info(`User deactivated by admin: ${user.email}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    throw error;
  }
};

export const getFavourites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;

    // Check if user can access favourites
    if (requestingUser._id.toString() !== id && requestingUser.role !== 'admin') {
      throw createError('Access denied', 403);
    }

    const user = await User.findById(id).populate({
      path: 'favourites',
      populate: {
        path: 'partnerId',
        select: 'name logoUrl'
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: { favourites: user.favourites }
    });
  } catch (error) {
    logger.error('Get favourites error:', error);
    throw error;
  }
};

export const addToFavourites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dishId } = req.body;
    const requestingUser = (req as AuthRequest).user;

    // Check if user can modify favourites
    if (requestingUser._id.toString() !== id) {
      throw createError('Access denied', 403);
    }

    // Check if dish exists
    const dish = await Dish.findById(dishId);
    if (!dish) {
      throw createError('Dish not found', 404);
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Check if already in favourites
    if (user.favourites.includes(dishId)) {
      return res.json({
        success: true,
        message: 'Dish already in favourites',
        data: { favourites: user.favourites }
      });
    }

    user.favourites.push(dishId);
    await user.save();

    const updatedUser = await User.findById(id).populate({
      path: 'favourites',
      populate: {
        path: 'partnerId',
        select: 'name logoUrl'
      }
    });

    res.json({
      success: true,
      message: 'Added to favourites',
      data: { favourites: updatedUser!.favourites }
    });
  } catch (error) {
    logger.error('Add to favourites error:', error);
    throw error;
  }
};

export const removeFromFavourites = async (req: Request, res: Response) => {
  try {
    const { id, dishId } = req.params;
    const requestingUser = (req as AuthRequest).user;

    // Check if user can modify favourites
    if (requestingUser._id.toString() !== id) {
      throw createError('Access denied', 403);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $pull: { favourites: dishId } },
      { new: true }
    ).populate({
      path: 'favourites',
      populate: {
        path: 'partnerId',
        select: 'name logoUrl'
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'Removed from favourites',
      data: { favourites: user.favourites }
    });
  } catch (error) {
    logger.error('Remove from favourites error:', error);
    throw error;
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;

    // Check if user can access cart
    if (requestingUser._id.toString() !== id) {
      throw createError('Access denied', 403);
    }

    const user = await User.findById(id).populate({
      path: 'cart.dishId',
      populate: {
        path: 'partnerId',
        select: 'name logoUrl'
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: { cart: user.cart }
    });
  } catch (error) {
    logger.error('Get cart error:', error);
    throw error;
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dishId, quantity, specialInstructions } = req.body;
    const requestingUser = (req as AuthRequest).user;

    // Check if user can modify cart
    if (requestingUser._id.toString() !== id) {
      throw createError('Access denied', 403);
    }

    // Check if dish exists and is available
    const dish = await Dish.findById(dishId);
    if (!dish) {
      throw createError('Dish not found', 404);
    }

    if (!dish.isAvailable) {
      throw createError('Dish is not available', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.dishId.toString() === dishId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      user.cart[existingItemIndex].quantity = quantity;
      user.cart[existingItemIndex].specialInstructions = specialInstructions;
      user.cart[existingItemIndex].addedAt = new Date();
    } else {
      // Add new item
      user.cart.push({
        dishId,
        quantity,
        specialInstructions,
        addedAt: new Date()
      });
    }

    await user.save();

    const updatedUser = await User.findById(id).populate({
      path: 'cart.dishId',
      populate: {
        path: 'partnerId',
        select: 'name logoUrl'
      }
    });

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cart: updatedUser!.cart }
    });
  } catch (error) {
    logger.error('Add to cart error:', error);
    throw error;
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const requestingUser = (req as AuthRequest).user;

    // Check if user can modify cart
    if (requestingUser._id.toString() !== id) {
      throw createError('Access denied', 403);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $pull: { cart: { _id: itemId } } },
      { new: true }
    ).populate({
      path: 'cart.dishId',
      populate: {
        path: 'partnerId',
        select: 'name logoUrl'
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: { cart: user.cart }
    });
  } catch (error) {
    logger.error('Remove from cart error:', error);
    throw error;
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestingUser = (req as AuthRequest).user;

    // Check if user can modify cart
    if (requestingUser._id.toString() !== id) {
      throw createError('Access denied', 403);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { cart: [] } },
      { new: true }
    );

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      data: { cart: user.cart }
    });
  } catch (error) {
    logger.error('Clear cart error:', error);
    throw error;
  }
};