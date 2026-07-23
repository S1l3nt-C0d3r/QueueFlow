import { runMigrations } from "./database/migrations";
import { seedDatabase } from "./database/seed";
import { logger } from "./shared/logger";
import "./events/handlers/audit.handler";

export async function bootstrap() {
    logger.info("Initializing QueueFlow...");

    // Create tables
    runMigrations();

    // Seed default data
    await seedDatabase();

    logger.info("Database initialized successfully.");

    // Future startup tasks go here:
    //
    // initializeSocket();
    // initializeScheduler();
    // initializeBackups();
    // checkLicense();
    // checkForUpdates();
}