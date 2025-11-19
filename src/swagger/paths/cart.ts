/**
 * @swagger
 * components:
 *   schemas:
 *     CartItemCreated:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 7
 *         user_id:
 *           type: integer
 *           example: 1
 *         product_id:
 *           type: integer
 *           example: 18
 *         product_quantity:
 *           type: integer
 *           example: 2
 *         product_variant_id:
 *           type: integer
 *           nullable: true
 *           example: 7
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-18T13:29:21.330Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-18T13:31:53.769Z"
 *     CartItemRetrieved:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 7
 *         productId:
 *           type: integer
 *           example: 18
 *         variantId:
 *           type: integer
 *           nullable: true
 *           example: 7
 *         productImage:
 *           type: string
 *           example: "http://localhost:4000/uploads/1763233056965-679427830.png"
 *         productQuantity:
 *           type: integer
 *           example: 2
 *     AddCartItem:
 *       type: object
 *       required:
 *         - productId
 *         - userId
 *       properties:
 *         productId:
 *           type: integer
 *           example: 123
 *         userId:
 *           type: integer
 *           example: 1
 *         variantId:
 *           type: integer
 *           example: 2
 * 
 *     DeleteCartItem:
 *       type: object
 *       required:
 *         - productId
 *         - userId
 *       properties:
 *         productId:
 *           type: integer
 *         userId:
 *           type: integer
 *         removeCompletely:
 *           type: boolean
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         product:
 *           type: object
 *         product_quantity:
 *           type: integer
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart
 *     tags:
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCartItem'         
 *     responses:
 *       '200':
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CartItemCreated'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Delete or decrement item from cart
 *     tags:
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteCartItem'
 *     responses:
 *       '204':
 *         description: Item removed or quantity decremented (no content)
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /cart/{userId}:
 *   get:
 *     summary: Get cart items for a user
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       '200':
 *         description: Cart items retrieved successfully
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
 *                         $ref: '#/components/schemas/CartItemRetrieved'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export {};
