import { Router } from 'express';
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerDishes,
  getPartnerOrders
} from '../controllers/partners.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createPartnerSchema, partnerQuerySchema } from '../utils/validators';

const router = Router();

/**
 * @swagger
 * /api/partners:
 *   get:
 *     summary: Get all partners
 *     tags: [Partners]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
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
 *         description: Partners retrieved successfully
 */
router.get('/', optionalAuth, validateQuery(partnerQuerySchema), getPartners);

/**
 * @swagger
 * /api/partners/{id}:
 *   get:
 *     summary: Get partner by ID
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partner retrieved successfully
 *       404:
 *         description: Partner not found
 */
router.get('/:id', optionalAuth, getPartnerById);

/**
 * @swagger
 * /api/partners:
 *   post:
 *     summary: Create new partner
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - contact
 *               - businessInfo
 *               - deliveryInfo
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               address:
 *                 type: object
 *               contact:
 *                 type: object
 *               businessInfo:
 *                 type: object
 *               deliveryInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Partner created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, validate(createPartnerSchema), createPartner);

/**
 * @swagger
 * /api/partners/{id}:
 *   put:
 *     summary: Update partner
 *     tags: [Partners]
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
 *         description: Partner updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Partner not found
 */
router.put('/:id', authenticate, updatePartner);

/**
 * @swagger
 * /api/partners/{id}:
 *   delete:
 *     summary: Delete partner
 *     tags: [Partners]
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
 *         description: Partner deactivated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Partner not found
 */
router.delete('/:id', authenticate, deletePartner);

/**
 * @swagger
 * /api/partners/{id}/dishes:
 *   get:
 *     summary: Get partner dishes
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Partner dishes retrieved successfully
 *       404:
 *         description: Partner not found
 */
router.get('/:id/dishes', optionalAuth, getPartnerDishes);

/**
 * @swagger
 * /api/partners/{id}/orders:
 *   get:
 *     summary: Get partner orders
 *     tags: [Partners]
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
 *         description: Partner orders retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Partner not found
 */
router.get('/:id/orders', authenticate, getPartnerOrders);

export default router;