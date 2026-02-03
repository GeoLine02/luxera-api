import logger from "../../logger";
import cron from "node-cron";
import Verifications from "../../sequelize/models/verifications";
import { Op } from "sequelize";
export async function cleanupExpiredVerifications(): Promise<number> {
  try {
    const now = new Date();

    const deletedCount = await Verifications.destroy({
      where: {
        expires_at: {
          [Op.lt]: now,
        },
      },
    });

    if (deletedCount > 0) {
      logger.info(
        `[Cleanup Job] Deleted ${deletedCount} expired verification records`,
      );
    }

    return deletedCount;
  } catch (error) {
    logger.error("[Cleanup Job] Error during cleanup:", error);
    return 0;
  }
}

export function startVerificationCleanupTask(): void {
  // Run every 30 minutes: '*/30 * * * *'
  const task = cron.schedule("0 * * * *", async () => {
    await cleanupExpiredVerifications();
  });

  logger.info("✅ Verification cleanup job started (cron: every hour");

  // Graceful shutdown
  process.on("SIGTERM", () => {
    task.stop();
  });
}
