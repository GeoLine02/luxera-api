import express from "express";
import productRoutes from "./seller.products.routes";
const router = express.Router();
router.use("/products",productRoutes)


export default router;