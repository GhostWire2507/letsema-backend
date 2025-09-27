import { Router } from 'express';
import {
  getDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  getFeaturedDishes,
  getDishesByCategory
} from '../controllers/dishes.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createDishSchema, dishQuerySchema } from '../utils/validators';

const router = Router();

/**
 * @swagger
 * /api/dishes:
 *   get:
 *     summary: Get all dishes
 *     tags: [Dishes]
 *     parameters:
 *       - in: query
 *         name: partnerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVegetarian
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isVegan
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isSpicy
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Dishes retrieved successfully
 */
router.get('/', optionalAuth, validateQuery(dishQuerySchema), getDishes);

/**
 * @swagger
 * /api/dishes/featured:
 *   get:
 *     summary: Get featured dishes
 *     tags: [Dishes]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Featured dishes retrieved successfully
 */
router.get('/featured', optionalAuth, getFeaturedDishes);

/**
 * @swagger
 * /api/dishes/categories:
 *   get:
 *     summary: Get dishes grouped by category
 *     tags: [Dishes]
 *     responses:
 *       200:
 *         description: Dishes by category retrieved successfully
 */
router.get('/categories', optionalAuth, getDishesByCategory);

/**
 * @swagger
 * /api/dishes/{id}:
 *   get:
 *     summary: Get dish by ID
 *     tags: [Dishes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dish retrieved successfully
 *       404:
 *         description: Dish not found
 */
router.get('/:id', optionalAuth, getDishById);

/**
 * @swagger
 * /api/dishes/{id}:
 *   put:
 *     summary: Update dish
 *     tags: [Dishes]
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
 *         description: Dish updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Dish not found
 */
router.put('/:id', authenticate, updateDish);

/**
 * @swagger
 * /api/dishes/{id}:
 *   delete:
 *     summary: Delete dish
 *     tags: [Dishes]
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
 *         description: Dish deactivated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Dish not found
 */
router.delete('/:id', authenticate, deleteDish);

// Partner-specific dish routes
/**
 * @swagger
 * /api/partners/{partnerId}/dishes:
 *   post:
 *     summary: Create dish for partner
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: partnerId
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
 *               - name
 *               - description
 *               - price
 *               - category
 *               - preparationTime
 *               - servingSize
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               photoUrl:
 *                 type: string
 *               category:
 *                 type: string
 *               preparationTime:
 *                 type: number
 *               servingSize:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Dish created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 */
router.post('/partners/:partnerId/dishes', authenticate, validate(createDishSchema), createDish);

export default router;