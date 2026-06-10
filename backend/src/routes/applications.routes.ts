import { Router } from "express";
import { ApplicationsController } from "../controllers/applications.controller";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// Candidate routes
router.get(
  "/mine",
  authenticate,
  requireRole("CANDIDATE"),
  ApplicationsController.getMine,
);
router.post(
  "/from-cv",
  authenticate,
  requireRole("CANDIDATE"),
  ApplicationsController.submitFromSavedCV,
);

// HR routes
router.get(
  "/by-site",
  authenticate,
  requireRole("HR"),
  ApplicationsController.getBySite,
);

// Bulk operations — must come BEFORE /:id routes to avoid param collision
router.patch(
  "/bulk-status",
  authenticate,
  requireRole("HR", "ADMIN"),
  ApplicationsController.bulkUpdateStatus,
);

router.get("/:id", authenticate, ApplicationsController.getById);
router.patch(
  "/:id/status",
  authenticate,
  requireRole("HR", "ADMIN"),
  ApplicationsController.updateStatus,
);
router.patch(
  "/:id/notes",
  authenticate,
  requireRole("HR"),
  ApplicationsController.updateNotes,
);
router.patch(
  "/:id/rating",
  authenticate,
  requireRole("HR"),
  ApplicationsController.updateRating,
);
router.patch(
  "/:id/tags",
  authenticate,
  requireRole("HR"),
  ApplicationsController.updateTags,
);
router.patch(
  "/:id/analysis",
  authenticate,
  requireRole("HR", "ADMIN"),
  ApplicationsController.saveAnalysis,
);
router.post(
  "/:id/analyse",
  authenticate,
  requireRole("HR"),
  ApplicationsController.analyse,
);

router.get(
  "/:id/cv",
  authenticate,
  requireRole("HR", "ADMIN"),
  ApplicationsController.downloadCV,
);

export default router;
