import e from "express";
import sellerProductsRoutes from "./seller.products.routes";
import sellerNotificationsRoutes from "./seller.notifications.routes";
const router = e.Router();
router.use("/products", sellerProductsRoutes);
router.use("/notifications", sellerNotificationsRoutes);
export default router;
