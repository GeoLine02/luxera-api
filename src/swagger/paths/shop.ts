/**
 * @swagger
 * /shop/register:
 *   post:
 *     summary: Register a new shop
 *     tags:
 *       - Shop
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopName
 *               - password
 *               - userId
 *             properties:
 *               shopName:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               userId:
 *                 type: integer
 *     responses:
 *       '200':
 *         description: Shop registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ShopTokensResponse'
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
 * /shop/login:
 *   post:
 *     summary: Shop login
 *     tags:
 *       - Shop
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *         description: plain password query string
 *     responses:
 *       '200':
 *         description: Shop logged in successfully. Shop refresh token in httpOnly cookie
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ShopTokensResponse'
 *       '401':
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /shop/refresh:
 *   get:
 *     summary: Refresh shop access token
 *     tags:
 *       - Shop
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ShopAccessTokenResponse'
 *       '401':
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /shop:
 *   get:
 *     summary: Get authenticated shop profile
 *     tags:
 *       - Shop
 *     security:
 *       - ShopCookieAuth: []
 *     responses:
 *       '200':
 *         description: Shop profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         shopName:
 *                           type: string
 *                         shopEmail:
 *                           type: string
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /shop:
 *   delete:
 *     summary: Delete authenticated shop
 *     tags:
 *       - Shop
 *     security:
 *       - ShopCookieAuth: []
 *     responses:
 *       '200':
 *         description: Shop deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export {};
