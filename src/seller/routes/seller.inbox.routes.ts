import e from "express";
import { authGuard, shopAuthGuard } from "../../middleware/authGuard";
import {
  DeleteNotificationController,
  GetSellerNotificationsController,
  GetUnreadCountController,
  MarkAllNotificationsAsReadController,
  MarkNotificationAsReadController,
} from "../controller/seller.inbox.controller";
const router = e.Router();
router.get("/", authGuard, shopAuthGuard, GetSellerNotificationsController);
router.get("/unread-count", authGuard, shopAuthGuard, GetUnreadCountController);
router.patch(
  "/:id/read",
  authGuard,
  shopAuthGuard,
  MarkNotificationAsReadController,
);
router.patch(
  "/read-all",
  authGuard,
  shopAuthGuard,
  MarkAllNotificationsAsReadController,
);

router.delete("/:id", authGuard, shopAuthGuard, DeleteNotificationController);
export default router;
