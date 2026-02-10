import { Request, Response } from "express";
import { ValidationError } from "../../errors/errors";
import {
  DeleteNotificationService,
  GetSellerNotificationsService,
  GetUnreadCountService,
  MarkAllNotificationsAsReadService,
  MarkNotificationAsReadService,
} from "../services/inbox/seller.inbox.service";
import {
  paginatedResponse,
  successfulResponse,
} from "../../utils/responseHandler";
import Notifications from "../../sequelize/models/notifications";
import { PAGE_SIZE } from "../../constants/constants";
async function GetSellerNotificationsController(req: Request, res: Response) {
  const page = Number(req.query.page);
  if (isNaN(page) || page < 1) {
    throw new ValidationError([
      {
        field: "page",
        message: "Invalid page number",
      },
    ]);
  }

  const { rows, count } = await GetSellerNotificationsService(req, page);

  const hasMore = count > page * PAGE_SIZE + rows.length;

  return paginatedResponse(
    res,
    "Successfully fetched notifications",
    rows,
    hasMore,
    page,
  );
}
async function MarkNotificationAsReadController(req: Request, res: Response) {
  const id = Number(req.params.id);

  await MarkNotificationAsReadService(id, req);
  return successfulResponse(res, "Notification marked as read", []);
}

async function MarkAllNotificationsAsReadController(
  req: Request,
  res: Response,
) {
  await MarkAllNotificationsAsReadService(req);
  return successfulResponse(res, "All notifications marked as read", []);
}

async function DeleteNotificationController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (isNaN(id) || id < 0) {
    throw new ValidationError([
      {
        field: "id",
        message: "Invalid notification ID",
      },
    ]);
  }

  await DeleteNotificationService(id, req);
  return successfulResponse(res, "Notification deleted", []);
}

async function GetUnreadCountController(req: Request, res: Response) {
  const unreadCount = await GetUnreadCountService(req);
  return successfulResponse(res, "Unread count fetched", { unreadCount });
}

export {
  GetSellerNotificationsController,
  MarkNotificationAsReadController,
  MarkAllNotificationsAsReadController,
  DeleteNotificationController,
  GetUnreadCountController,
};
