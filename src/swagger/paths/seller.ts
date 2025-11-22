/**
 * @swagger
 * /seller/products:
 *   get:
 *     summary: Get all products for authenticated seller
 *     tags:
 *       - Seller Products
 *     responses:
 *       '200':
 *         description: Seller products retrieved
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
 *                         $ref: '#/components/schemas/Product'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /seller/products/create:
 *   post:
 *     summary: Create a new product with variants and images
 *     tags:
 *       - Seller Products
 *     security:
 *       - ShopCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productDescription
 *               - productPrice
 *               - productQuantity
 *               - productDiscount
 *               - userId
 *               - productCategoryId
 *               - subCategoryId
 *               - productPreviewImages
 *             properties:
 *               productName:
 *                 type: string
 *               productDescription:
 *                 type: string
 *               productPrice:
 *                 type: number
 *                 format: float
 *               productQuantity:
 *                 type: integer
 *               productDiscount:
 *                 type: number
 *                 format: float
 *               userId:
 *                 type: integer
 *               productCategoryId:
 *                 type: integer
 *               subCategoryId:
 *                 type: integer
 *               variantsMetadata:
 *                 type: string
 *                 description: JSON string of variant data (optional)
 *               productPreviewImages:
 *                 type: string
 *                 format: binary
 *                 description: Main product preview image
 *               variantImages_0:
 *                 type: string
 *                 format: binary
 *                 description: First variant image (optional, use variantImages_1, variantImages_2 etc. for more)
 *     responses:
 *       '201':
 *         description: Product created successfully with variants and images
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CreatedProductResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
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
 * /seller/products/update:
 *   put:
 *     summary: Update an existing product
 *     tags:
 *       - Seller Products
 *     security:
 *       - ShopCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *               productName:
 *                 type: string
 *               productDescription:
 *                 type: string
 *               productPrice:
 *                 type: number
 *                 format: float
 *               productQuantity:
 *                 type: integer
 *               productDiscount:
 *                 type: number
 *                 format: float
 *               userId:
 *                 type: integer
 *               productCategoryId:
 *                 type: integer
 *               subCategoryId:
 *                 type: integer
 *               variantsMetadata:
 *                 type: string
 *                 description: JSON string of variant data (optional)
 *               productPreviewImages:
 *                 type: string
 *                 format: binary
 *                 description: Main product preview image (optional)
 *               variantImages_0:
 *                 type: string
 *                 format: binary
 *                 description: First variant image (optional, use variantImages_1, variantImages_2 etc. for more)
 *     responses:
 *       '200':
 *         description: Product updated successfully with variants and images
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CreatedProductResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Product not found
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
 * /seller/products:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Seller Products
 *     security:
 *       - ShopCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to delete
 *     responses:
 *       '200':
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: 'null'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Product not found
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


