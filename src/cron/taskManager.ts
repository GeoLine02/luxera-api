import { backupDatabase, startDatabaseBackupTask } from "./tasks/dbBackup";
import { startOrderTasks } from "./tasks/orderTasks";
import { startVerificationCleanupTask } from "./tasks/verificationsCleanup";
export async function runTasks() {
  startVerificationCleanupTask();
  startDatabaseBackupTask();
  startOrderTasks();
}
