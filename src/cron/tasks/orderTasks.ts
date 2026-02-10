import { Op } from "sequelize";
import { OrderStatus } from "../../constants/enums";
import Orders from "../../sequelize/models/orders";
import logger from "../../logger";
import cron from "node-cron";
const ONE_MONTH_AGO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d;
};

export async function cancelPendingPaymentOrders(): Promise<number> {
  try {
    const oneMonthAgo = ONE_MONTH_AGO();

    const [updatedCount] = await Orders.update(
      { status: OrderStatus.OrderCancelled },
      {
        where: {
          status: OrderStatus.OrderPendingPayment,
          createdAt: {
            [Op.lt]: oneMonthAgo,
          },
        },
        // returning: true,   // uncomment if you use PostgreSQL + want old rows
      },
    );

    if (updatedCount > 0) {
      logger.info(
        `[Cleanup Job] Cancelled ${updatedCount} pending orders older than 1 month`,
      );
    } else {
      logger.debug(
        "[Cleanup Job] No pending orders older than 1 month to cancel",
      );
    }

    return updatedCount;
  } catch (error) {
    logger.error("[Cleanup Job] Failed to cancel old pending orders:", error);
    return 0;
  }
}

export async function cleanupCancelledOrders(): Promise<number> {
  try {
    const oneMonthAgo = ONE_MONTH_AGO();

    const deletedCount = await Orders.destroy({
      where: {
        status: OrderStatus.OrderCancelled,
        createdAt: {
          [Op.lt]: oneMonthAgo,
        },
      },
    });
    if (deletedCount > 0) {
      logger.info(
        `[Cleanup Job] Deleted ${deletedCount} cancelled orders older than 1 month`,
      );
    } else {
      logger.debug(
        "[Cleanup Job] No cancelled orders older than 1 month to delete",
      );
    }

    return deletedCount;
  } catch (error) {
    logger.error("[Cleanup Job] Failed to delete old cancelled orders:", error);
    return 0;
  }
}
export function startOrderTasks(): void {
  // Run every 30 minutes: '*/30 * * * *'
  const task = cron.schedule("* * 1 * *", async () => {
    await cancelPendingPaymentOrders();
    await cleanupCancelledOrders();
  });

  logger.info("✅ Orders job started (cron: every month");

  // Graceful shutdown
  process.on("SIGTERM", () => {
    task.stop();
  });
}
