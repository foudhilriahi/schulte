import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { createServer } from "http";

import { env } from "./config/env";
import { getAllowedOriginsForLog, isAllowedOrigin } from "./config/origins";
import logger from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import offersRoutes from "./routes/offers.routes";
import applicationsRoutes from "./routes/applications.routes";
import profileRoutes from "./routes/profile.routes";
import interviewsRoutes from "./routes/interviews.routes";
import notificationsRoutes from "./routes/notifications.routes";
import uploadsRoutes from "./routes/uploads.routes";
import candidateCVRoutes from "./routes/candidate-cv.routes";

import { SocketService } from "./services/socket.service";
import { NotificationService } from "./services/notification.service";
import { startCronJobs } from "./services/cron.service";

const app = express();
const httpServer = createServer(app);

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Initialize Socket.io
SocketService.init(httpServer);

// Initialize notification observers and cron jobs
NotificationService.init();
startCronJobs();

// ============ MIDDLEWARE ============
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin ?? "unknown"}`));
    },
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Static files (uploaded CVs) - now authenticated
app.use("/api/uploads", uploadsRoutes);

// ============ ROUTES ============
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/interviews", interviewsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/cvs", candidateCVRoutes);

// ============ ERROR HANDLER ============
app.use(errorHandler);

// ============ START SERVER ============
httpServer.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Explicit CORS origins: ${getAllowedOriginsForLog().join(", ")}`);
  logger.info("Dynamic CORS allowed for localhost, *.trycloudflare.com, *.ngrok-free.app, *.ngrok.app");
});

export { app, httpServer };
