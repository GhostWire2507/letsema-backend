import { Router } from 'express';
import {
  getUserById,
  updateUser,
  deleteUser,
  getFavourites,
  addToFavourites,
  removeFromFavourites,
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} from '../controllers/users.controller';
import { authenticate, authorize } from '../middleware/auth';
import { sensitiveRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validation';
import { addToFavouritesSchema, addToCartSchema } from '../utils/validators';

const router = Router();

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticate, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

// Favourites routes
/**
 * @swagger
 * /api/users/{id}/favourites:
 *   get:
 *     summary: Get user favourites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favourites retrieved successfully
 */
router.get('/:id/favourites', authenticate, getFavourites);

/**
 * @swagger
 * /api/users/{id}/favourites:
 *   post:
 *     summary: Add dish to favourites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dishId
 *             properties:
 *               dishId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Added to favourites
 */
router.post('/:id/favourites', authenticate, sensitiveRateLimiter, validate(addToFavouritesSchema), addToFavourites);

/**
 * @swagger
 * /api/users/{id}/favourites/{dishId}:
 *   delete:
 *     summary: Remove dish from favourites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed from favourites
 */
router.delete('/:id/favourites/:dishId', authenticate, removeFromFavourites);

// Cart routes
/**
 * @swagger
 * /api/users/{id}/cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get('/:id/cart', authenticate, getCart);

/**
 * @swagger
 * /api/users/{id}/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dishId
 *               - quantity
 *             properties:
 *               dishId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *               specialInstructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added to cart
 */
router.post('/:id/cart', authenticate, validate(addToCartSchema), addToCart);

/**
 * @swagger
 * /api/users/{id}/cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete('/:id/cart/:itemId', authenticate, removeFromCart);

/**
 * @swagger
 * /api/users/{id}/cart:
 *   delete:
 *     summary: Clear cart
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/:id/cart', authenticate, clearCart);

export default router;