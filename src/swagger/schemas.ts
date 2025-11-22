/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: User access token (JWT from /user/login response or Bearer token in Authorization header)
 *     CookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *       description: User access token (JWT stored in httpOnly cookie from /user/login)
 *     ShopCookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: shopAccessToken
 *       description: Shop access token (JWT stored in httpOnly cookie from /shop/login)
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         validationErrors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         page:
 *           type: integer
 *         pageSize:
 *           type: integer
 *         hasMore:
 *           type: boolean
 
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         productId:
 *           type: integer
 *           example: 5
 *         variantId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         productName:
 *           type: string
 *           example: "T-Shirt"
 *         productImage:
 *           type: string
 *           example: "image-url.jpg"
 *         productQuantity:
 *           type: integer
 *           example: 3
 *         productPrice:
 *           type: number
 *           format: float
 *           example: 29.99
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         product_name:
 *           type: string
 *           example: "Premium T-Shirt"
 *         product_description:
 *           type: string
 *           example: "High quality cotton t-shirt"
 *         product_price:
 *           type: number
 *           format: float
 *           example: 29.99
 *         product_image:
 *           type: string
 *           example: "image-url.jpg"
 *         product_subcategory_id:
 *           type: number
 *           
 *         product_status:
 *           type: string
 *           enum: [active, vip,featured]
 *         product_discount:
 *           type: number
 *         product_quantity:
 *           type: number
 *         product_rating:
 *           type: number
 *         shop_id:
 *           type: number
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         full_name:
 *           type: string
 *         role:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         category_name:
 *           type: string
 *           example: "Fashion"
 *         category_image:
 *           type: string
 *           example: "image-url.jpg"
 *     ProductImage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         image:
 *           type: string
 *           example: "http://localhost:4000/uploads/1763233056971-94874406.png"
 *         product_id:
 *           type: integer
 *           example: 18
 *         variant_id:
 *           type: integer
 *           nullable: true
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T18:57:37.126Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T18:57:37.126Z"
 *     ProductVariant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 7
 *         variant_name:
 *           type: string
 *           example: "ixvis tolmis bedi"
 *         variant_price:
 *           type: string
 *           example: "10"
 *         variant_quantity:
 *           type: integer
 *           example: 1
 *         variant_discount:
 *           type: string
 *           example: "0"
 *         product_id:
 *           type: integer
 *           example: 18
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T18:57:37.133Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T18:57:37.133Z"
 *     ProductOwner:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         full_name:
 *           type: string
 *           example: "John Doe"
 *         role:
 *           type: string
 *           example: "user"
 *         email:
 *           type: string
 *           format: email
 *           example: "johndoe@gmail.com"
 *     ProductDetailed:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 18
 *         product_name:
 *           type: string
 *           example: "nigozi"
 *         product_price:
 *           type: integer
 *           example: 483
 *         product_description:
 *           type: string
 *           example: "gemrilia"
 *         product_rating:
 *           type: integer
 *           example: 0
 *         product_image:
 *           type: string
 *           example: "http://localhost:4000/uploads/1763233056971-94874406.png"
 *         shop_id:
 *           type: integer
 *           example: 1
 *         product_owner_id:
 *           type: integer
 *           example: 1
 *         product_subcategory_id:
 *           type: integer
 *           example: 1
 *         product_status:
 *           type: string
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T18:57:37.046Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T18:57:37.046Z"
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
 *         owner:
 *           $ref: '#/components/schemas/ProductOwner'
 *     ProductSearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 18
 *         product_name:
 *           type: string
 *           example: "nigozi"
 *         product_price:
 *           type: integer
 *           example: 483
 *         product_description:
 *           type: string
 *           example: "gemrilia"
 *         product_rating:
 *           type: integer
 *           example: 0
 *         product_image:
 *           type: string
 *           example: "http://localhost:4000/uploads/1763233056971-94874406.png"
 *         shop_id:
 *           type: integer
 *           example: 1
 *         product_owner_id:
 *           type: integer
 *           example: 1
 *         product_subcategory_id:
 *           type: integer
 *           example: 1
 *         product_status:
 *           type: string
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T18:57:37.046Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-11-15T18:57:37.046Z"
 *         subCategory:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             sub_category_name:
 *               type: string
 *               example: "Smartphones"
 *             category:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 category_name:
 *                   type: string
 *                   example: "Electronics"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *     TokenResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *     VariantImage:
 *       type: object
 *       properties:
 *         image:
 *           type: string
 *           format: uri
 *         product_id:
 *           type: integer
 *         variant_id:
 *           type: integer
 *     ProductImageObject:
 *       type: object
 *       properties:
 *         image:
 *           type: string
 *           format: uri
 *         product_id:
 *           type: integer
 *     VariantsData:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
 *         allVariantImages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VariantImage'
 *     CreatedProductResponse:
 *       type: object
 *       properties:
 *         product:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             product_name:
 *               type: string
 *             product_description:
 *               type: string
 *             product_price:
 *               type: number
 *               format: float
 *             product_rating:
 *               type: number
 *             product_status:
 *               type: string
 *               enum: [active, inactive]
 *             product_subcategory_id:
 *               type: integer
 *             product_owner_id:
 *               type: integer
 *             product_image:
 *               type: string
 *               format: uri
 *             shop_id:
 *               type: integer
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImageObject'
 *         variants:
 *           $ref: '#/components/schemas/VariantsData'
 *     ShopTokensResponse:
 *       type: object
 *       properties:
 *         shopAccessToken:
 *           type: string
 *         shopRefreshToken:
 *           type: string
 *     ShopAccessTokenResponse:
 *       type: object
 *       properties:
 *         shopAccessToken:
 *           type: string
 *     UserRegisterResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             role:
 *               type: string
 *             full_name:
 *               type: string
 *             email:
 *               type: string
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *     UserLoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */

