import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { requireRole } from "../middleware/requireRole";
import { upload } from "../services/upload.service";
import { CandidateCVController } from "../controllers/candidate-cv.controller";

const router = Router();

router.get("/mine", authenticate, requireRole("CANDIDATE"), CandidateCVController.getMine);
router.post(
  "/upload",
  authenticate,
  requireRole("CANDIDATE"),
  upload.single("cvFile"),
  CandidateCVController.upload,
);
router.post(
  "/generated",
  authenticate,
  requireRole("CANDIDATE"),
  CandidateCVController.createGenerated,
);
router.patch(
  "/:id/default",
  authenticate,
  requireRole("CANDIDATE"),
  CandidateCVController.setDefault,
);
router.delete("/:id", authenticate, requireRole("CANDIDATE"), CandidateCVController.remove);

export default router;
