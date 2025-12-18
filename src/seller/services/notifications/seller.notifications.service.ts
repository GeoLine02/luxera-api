import { PAGE_SIZE } from "../../../constants/constants";
import sequelize from "../../../db";
import Notifications from "../../../sequelize/models/notifications";
import { Request } from "express";
import Products from "../../../sequelize/models/products";
import ProductVariants from "../../../sequelize/models/productvariants";
import { NotFoundError } from "../../../errors/errors";
async function GetSellerNotificationsService(req: Request, page: number) {
  return await sequelize.transaction(async () => {
    const notifications = await Notifications.findAndCountAll({
      where: {
        shop_id: req.shop!.id,
        recipient_id: req.user!.id,
      },
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      order: [
        ["read_at", "ASC"], // Unread first
        ["createdAt", "DESC"], // Then by date
      ],
      include: [
        {
          model: Products,
          as: "product",
          include: [
            {
              model: ProductVariants,
              as: "primaryVariant",
            },
          ],
        },
      ],
    });
    if (!notifications) throw new Error("No notifications found");
    return notifications;
  });
}
async function MarkNotificationAsReadService(id: number, req: Request) {
  return await sequelize.transaction(async () => {
    const notification = await Notifications.findByPk(id);

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (
      notification.shop_id !== req.shop!.id ||
      notification.recipient_id !== req.user!.id
    ) {
      throw new NotFoundError("Notification not found");
    }

    notification.read = true;
    notification.read_at = new Date();
    await notification.save();
    return notification;
  });
}

async function MarkAllNotificationsAsReadService(req: Request) {
  return await sequelize.transaction(async () => {
    await Notifications.update(
      { read: true, read_at: new Date() },
      {
        where: {
          shop_id: req.shop!.id,
          recipient_id: req.user!.id,
          read_at: null,
        },
      }
    );
  });
}

async function DeleteNotificationService(id: number, req: Request) {
  return await sequelize.transaction(async () => {
    const notification = await Notifications.findByPk(id);

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (
      notification.shop_id !== req.shop!.id ||
      notification.recipient_id !== req.user!.id
    ) {
      throw new NotFoundError("Notification not found");
    }

    await notification.destroy();
  });
}

async function GetUnreadCountService(req: Request) {
  return await Notifications.count({
    where: {
      shop_id: req.shop!.id,
      recipient_id: req.user!.id,
      read_at: null,
      read: false,
    },
  });
}

export {
  GetSellerNotificationsService,
  MarkNotificationAsReadService,
  MarkAllNotificationsAsReadService,
  DeleteNotificationService,
  GetUnreadCountService,
};
