import e from "express";
import sellerProductsRoutes from "./seller.products.routes";

const router = e.Router();
router.use("/products", sellerProductsRoutes);
export default router;
