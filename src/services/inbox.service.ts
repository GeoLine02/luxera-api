// // services/notificationService.ts
// import { Request } from "express";
// import Notifications from "../sequelize/models/notifications";
// import Products from "../sequelize/models/products";
// import ProductImages from "../sequelize/models/productimages";
// import Shop from "../sequelize/models/shop";
// import { NotFoundError } from "../errors/errors";
// import sequelize from "../db";
// import ProductVariants from "../sequelize/models/productvariants";

// export async function GetUserNotificationsService(req: Request) {
//   const userId = req.user?.id;
//   const { page = 1, limit = 20, unreadOnly = false } = req.query;

//   const offset = (Number(page) - 1) * Number(limit);

//   const whereClause: any = { recipient_id: userId };
//   if (unreadOnly === "true") {
//     whereClause.read = false;
//   }

//   const { count, rows: notifications } = await Notifications.findAndCountAll({
//     where: whereClause,
//     include: [
//       {
//         model: Products,
//         as: "product",
//         attributes: ["id", "name", "product_status"],
//         include: [
//           {
//             model: ProductVariants,
//             as: "primaryVariant",
//             foreignKey: "primary_variant_id",
//           },
//         ],
//       },
//       {
//         model: Shop,
//         as: "shop",
//         attributes: ["id", "name"],
//       },
//     ],
//     order: [["createdAt", "DESC"]],
//     limit: Number(limit),
//     offset,
//   });

//   return {
//     notifications,
//     pagination: {
//       total: count,
//       page: Number(page),
//       limit: Number(limit),
//       totalPages: Math.ceil(count / Number(limit)),
//     },
//   };
// }

// export async function MarkNotificationAsReadService(req: Request) {
//   const { notificationId } = req.params;
//   const userId = req.user?.id;

//   return await sequelize.transaction(async () => {
//     const notification = await Notifications.findOne({
//       where: {
//         id: notificationId,
//         recipient_id: userId,
//       },
//     });

//     if (!notification) {
//       throw new NotFoundError("Notification not found");
//     }

//     await notification.markAsRead();

//     return { notification };
//   });
// }

// export async function MarkAllNotificationsAsReadService(req: Request) {
//   const userId = req.user?.id;

//   return await sequelize.transaction(async () => {
//     const [updatedCount] = await Notifications.update(
//       {
//         read: true,
//         read_at: new Date(),
//       },
//       {
//         where: {
//           recipient_id: userId,
//           read: false,
//         },
//       }
//     );

//     return { updatedCount };
//   });
// }

// export async function GetUnreadCountService(req: Request) {
//   const userId = req.user?.id;

//   const count = await Notifications.count({
//     where: {
//       recipient_id: userId,
//       read: false,
//     },
//   });

//   return { unreadCount: count };
// }

// export async function DeleteNotificationService(req: Request) {
//   const { notificationId } = req.params;
//   const userId = req.user?.id;

//   return await sequelize.transaction(async () => {
//     const notification = await Notifications.findOne({
//       where: {
//         id: notificationId,
//         recipient_id: userId,
//       },
//     });

//     if (!notification) {
//       throw new NotFoundError("Notification not found");
//     }

//     await notification.destroy();

//     return { deleted: true };
//   });
// }

// export async function DeleteAllReadNotificationsService(req: Request) {
//   const userId = req.user?.id;

//   return await sequelize.transaction(async () => {
//     const deletedCount = await Notifications.destroy({
//       where: {
//         recipient_id: userId,
//         read: true,
//       },
//     });

//     return { deletedCount };
//   });
// }
