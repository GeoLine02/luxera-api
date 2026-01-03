import e from "express";
import sellerProductsRoutes from "./seller.products.routes";
import sellerNotificationsRoutes from "./seller.inbox.routes";
const router = e.Router();
router.use("/products", sellerProductsRoutes);
router.use("/inbox", sellerNotificationsRoutes);
export default router;
