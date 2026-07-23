import http from "http";

import app from "./app";
import { bootstrap } from "./bootstrap";
import { env } from "./config/env";
import { db } from "./database/connection";
import { logger } from "./shared/logger";

async function startServer() {
    try {
        // Initialize application
        await bootstrap();

        const server = http.createServer(app);

        server.listen(env.PORT, () => {
            logger.info(`
========================================
🚀 QueueFlow Backend Started
========================================
Environment : ${env.NODE_ENV}
Port        : ${env.PORT}
========================================
`);
        });
        server.on("error", (error) => {
        logger.error("HTTP server error:", error);
        process.exit(1);
    });

        let isShuttingDown = false;
        const shutdown = (signal: string) => {
            if (isShuttingDown) {
                return;
            }

            isShuttingDown = true;
            logger.info(`${signal} received. Shutting down...`);

            try {
                db.close();
                logger.info("SQLite connection closed.");
            } catch (error) {
                logger.error("Failed to close database:", error);
            }

            server.close(() => {
                logger.info("HTTP server stopped.");
                process.exit(0);
            });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {
        logger.error("Failed to start QueueFlow:", error);
        process.exit(1);
    }
}

startServer();