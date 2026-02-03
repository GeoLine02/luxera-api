import { backupDatabase, startDatabaseBackupTask } from "./tasks/dbBackup";
import { startVerificationCleanupTask } from "./tasks/verificationsCleanup";
export async function runTasks() {
  startVerificationCleanupTask();
  startDatabaseBackupTask();
}
