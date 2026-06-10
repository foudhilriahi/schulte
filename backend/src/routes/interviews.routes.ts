import { Router } from "express";
import { InterviewsController } from "../controllers/interviews.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { rateLimiter } from "../middleware/rateLimiter";
import { idempotency } from "../middleware/idempotency";

const router = Router();
router.use(rateLimiter(120, 1 * 60 * 1000));

router.get("/", authenticate, InterviewsController.getInterviews);
router.post(
  "/",
  authenticate,
  requireRole("HR", "ADMIN"),
  rateLimiter(30, 1 * 60 * 1000),
  idempotency(15 * 60 * 1000),
  InterviewsController.scheduleInterview,
);
router.patch(
  "/:id/outcome",
  authenticate,
  requireRole("HR", "ADMIN"),
  rateLimiter(60, 1 * 60 * 1000),
  idempotency(10 * 60 * 1000),
  InterviewsController.markOutcome,
);

export default router;
