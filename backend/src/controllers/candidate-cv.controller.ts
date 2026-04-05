import { Request, Response } from "express";
import { CandidateCVRepository } from "../repositories/candidate-cv.repository";
import logger from "../utils/logger";

const toTemplate = (value: any): "modern" | "classic" => {
  return value === "classic" ? "classic" : "modern";
};

export class CandidateCVController {
  static async getMine(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const cvs = await CandidateCVRepository.findByCandidate(candidateId);
      res.json(cvs);
    } catch (err) {
      logger.error("Get candidate CVs error:", err);
      res.status(500).json({ error: "Failed to fetch CVs" });
    }
  }

  static async upload(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "CV file is required" });
        return;
      }

      const name = file.originalname.replace(/\.pdf$/i, "").trim() || "Uploaded CV";

      const cv = await CandidateCVRepository.create({
        candidateId,
        name,
        type: "uploaded",
        source: "profile_upload",
        cvUrl: `/uploads/${file.filename}`,
        size: file.size,
      });

      res.status(201).json(cv);
    } catch (err) {
      logger.error("Upload candidate CV error:", err);
      res.status(500).json({ error: "Failed to upload CV" });
    }
  }

  static async createGenerated(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const { name, formData, template, isDefault } = req.body;

      if (!formData || typeof formData !== "object") {
        res.status(400).json({ error: "formData is required" });
        return;
      }

      const cv = await CandidateCVRepository.create({
        candidateId,
        name: typeof name === "string" && name.trim() ? name.trim() : "Generated CV",
        type: "generated",
        source: "profile_generated",
        formData,
        cvTemplate: toTemplate(template),
        isDefault: typeof isDefault === "boolean" ? isDefault : undefined,
      });

      res.status(201).json(cv);
    } catch (err) {
      logger.error("Create generated candidate CV error:", err);
      res.status(500).json({ error: "Failed to create generated CV" });
    }
  }

  static async setDefault(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const cvId = req.params.id as string;
      const cv = await CandidateCVRepository.setDefault(candidateId, cvId);

      if (!cv) {
        res.status(404).json({ error: "CV not found" });
        return;
      }

      res.json(cv);
    } catch (err) {
      logger.error("Set default CV error:", err);
      res.status(500).json({ error: "Failed to set default CV" });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const cvId = req.params.id as string;
      const removed = await CandidateCVRepository.delete(candidateId, cvId);

      if (!removed) {
        res.status(404).json({ error: "CV not found" });
        return;
      }

      res.status(204).send();
    } catch (err) {
      logger.error("Delete CV error:", err);
      res.status(500).json({ error: "Failed to delete CV" });
    }
  }
}
