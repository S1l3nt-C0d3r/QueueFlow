import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes";
import staffRoutes from "./modules/staff/staff.routes";
import queueRoutes from "./modules/queue/queue.routes";
import tablesRoutes from "./modules/tables/tables.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import menuRoutes from "./modules/menu/menu.routes";
import billingRoutes from "./modules/billing/billing.routes";
import diningSessionsRoutes from "./modules/dining-sessions/dining-sessions.routes";
import { errorMiddleware } from "./middleware/error";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Logging
app.use(morgan("dev"));

// JSON Body Parser
app.use(express.json());

// Health Check
app.get("/api/health", (_, res) => {
    res.json({
        status: "OK",
        message: "QueueFlow Server Running",
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/auth", authRoutes);
app.use(errorMiddleware);
app.use("/api/queue", queueRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/dining-sessions", diningSessionsRoutes);

export default app;