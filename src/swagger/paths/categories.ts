/**
 * @swagger
 * components:
 *   schemas:
 *     SubCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         sub_category_name:
 *           type: string
 *           example: "Smartphones"
 *         sub_category_image:
 *           type: string
 *           example: "smartphones.jpg"
 *         category_id:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-14T20:26:03.273Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-14T20:26:03.273Z"
 *     CategoryWithSubCategories:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         category_name:
 *           type: string
 *           example: "Electronics"
 *         category_image:
 *           type: string
 *           example: "electronics.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-14T20:26:03.197Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-14T20:26:03.197Z"
 *         subCategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubCategory'
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories with subcategories
 *     tags:
 *       - Categories
 *     responses:
 *       '200':
 *         description: Categories with subcategories retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoryWithSubCategories'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /categories/subCategories:
 *   get:
 *     summary: Get all subcategories
 *     tags:
 *       - Categories
 *     responses:
 *       '200':
 *         description: Subcategories retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SubCategory'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */


