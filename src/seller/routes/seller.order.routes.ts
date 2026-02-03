import e from "express";
import sellerProductsRoutes from "./seller.products.routes";
import sellerNotificationsRoutes from "./seller.inbox.routes";
import sellerOrderRoutes from "./seller.orders.routes";
const router = e.Router();
router.use("/products", sellerProductsRoutes);
router.use("/inbox", sellerNotificationsRoutes);
router.use("/orders", sellerOrderRoutes);

export default router;
