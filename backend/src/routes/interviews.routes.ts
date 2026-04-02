import { Router } from "express";
import { InterviewsController } from "../controllers/interviews.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.get("/", authenticate, InterviewsController.getInterviews);
router.post("/", authenticate, InterviewsController.scheduleInterview);
router.patch(
  "/:id/outcome",
  authenticate,
  requireRole("HR", "ADMIN"),
  InterviewsController.markOutcome,
);

export default router;
