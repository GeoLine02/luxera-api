import { exec } from "node:child_process";
import { promisify } from "node:util";
import { createGzip } from "node:zlib";
import { createReadStream, unlink, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../app";
import cron from "node-cron";
import logger from "../../logger";
const execAsync = promisify(exec);
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USERNAME;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || "5432";
const bucketName = process.env.S3_BACKUPS_BUCKET_NAME;

if (!dbName || !dbUser || !dbHost || !bucketName) {
  throw new Error("Missing required env variables for backup");
}

function getBackupFileName(): {
  localTar: string;
  localGz: string;
  s3Key: string;
} {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const base = `backup-${dbName}-${timestamp}`;
  return {
    localTar: path.join("/tmp", `${base}.dump`), // or use os.tmpdir()
    localGz: path.join("/tmp", `${base}.dump.gz`),
    s3Key: `db-backups/${base}.dump.gz`, // nice prefix + compression
  };
}

export async function backupDatabase() {
  const { localTar, localGz, s3Key } = getBackupFileName();
  console.log(`Starting backup → ${s3Key}`);

  try {
    // 1. Run pg_dump → custom format archive
    const pgDumpCmd = [
      "pg_dump",
      "-U",
      dbUser,
      "-h",
      dbHost,
      "-p",
      dbPort,
      "-F",
      "c", // custom format → pg_restore friendly
      "-f",
      localTar,
      "-d",
      dbName,
    ].join(" ");

    console.log("Executing pg_dump...");
    const { stderr } = await execAsync(pgDumpCmd, {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }, // ← never hardcode!
    });

    if (stderr) console.warn("pg_dump warnings:", stderr);

    // 2. Compress the dump
    console.log("Compressing...");
    await pipeline(
      createReadStream(localTar),
      createGzip({ level: 6 }), // balance speed vs compression
      createWriteStream(localGz),
    );

    // 3. Upload compressed file to S3 (streaming — low memory usage)
    console.log("Uploading to S3...");
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: createReadStream(localGz),
        ContentType: "application/gzip",
        ContentEncoding: "gzip",
      }),
    );
  } catch (err) {
    console.error("Backup failed:", err);
    throw err;
  } finally {
    await Promise.allSettled([
      new Promise<void>((resolve) => {
        unlink(localTar, (err) => {
          if (err) console.warn(`Failed to delete ${localTar}:`, err.message);
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        unlink(localGz, (err) => {
          if (err) console.warn(`Failed to delete ${localGz}:`, err.message);
          resolve();
        });
      }),
    ]);
  }
}

export const startDatabaseBackupTask = () => {
  const task = cron.schedule(
    "0 * * * *",
    async () => {
      try {
        await backupDatabase();
        const response = await fetch(process.env.HEARTBEAT_URL!);
        if (!response.ok) throw new Error(response.statusText);
        logger.info("Database backup completed");
      } catch (err) {
        logger.error("Database backup failed", { error: err });
      }
    },
    {
      timezone: "Asia/Tbilisi", // or your real timezone
    },
  );
  logger.info("✅ Database backup task scheduled");
  process.on("SIGTERM", () => task.stop());
};
