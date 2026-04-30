import { Router } from "express";
import { InterviewsController } from "../controllers/interviews.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();
router.use(rateLimiter(120, 1 * 60 * 1000));

router.get("/", authenticate, InterviewsController.getInterviews);
router.post(
  "/",
  authenticate,
  requireRole("HR", "ADMIN"),
  InterviewsController.scheduleInterview,
);
router.patch(
  "/:id/outcome",
  authenticate,
  requireRole("HR", "ADMIN"),
  InterviewsController.markOutcome,
);

export default router;
