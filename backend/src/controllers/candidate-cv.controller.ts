import { Request, Response } from "express";
import { CandidateCVRepository } from "../repositories/candidate-cv.repository";
import { extractTextFromPDF } from "../services/upload.service";
import { CVTextExtractor } from "../services/ai.service";
import logger from "../utils/logger";

const toTemplate = (value: any): "modern" | "classic" => {
  return value === "classic" ? "classic" : "modern";
};

const tunisianCities = new Set([
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Sfax",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Tozeur",
  "Kébili",
  "Gafsa",
]);

const degreeOptions = new Set([
  "Baccalauréat",
  "BTS",
  "Licence",
  "Licence Appliquée",
  "Master",
  "Ingénieur",
  "Doctorat",
  "CAP",
  "Autre",
]);

const namePattern = /^[A-Za-zÀ-ÿ'\-\s]{2,80}$/;
const phonePattern = /^\+?[0-9\s\-()]{8,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidString = (value: unknown, minLength = 1, maxLength = 200) => {
  return typeof value === "string" && value.trim().length >= minLength && value.trim().length <= maxLength;
};

const validateGeneratedCvData = (formData: any): string | null => {
  const personal = formData?.personal;

  if (!personal || typeof personal !== "object") return "Personal details are required";
  if (!isValidString(personal.name, 2, 80) || !namePattern.test(personal.name.trim())) return "Enter a valid full name";
  if (!isValidString(personal.email, 5, 120) || !emailPattern.test(personal.email.trim())) return "Enter a valid email address";
  if (!isValidString(personal.phone, 8, 20) || !phonePattern.test(personal.phone.trim())) return "Enter a valid phone number";
  if (!isValidString(personal.city, 1, 80) || !tunisianCities.has(personal.city.trim())) return "Select a real Tunisian city";

  if (!Array.isArray(formData?.education) || formData.education.length === 0) return "Add at least one education entry";
  for (const education of formData.education) {
    if (!education || typeof education !== "object") return "Education entries are invalid";
    if (!isValidString(education.degree, 1, 60) || !degreeOptions.has(education.degree.trim())) return "Select a valid degree";
    if (!isValidString(education.field, 2, 80)) return "Education field is required";
    if (!isValidString(education.institution, 2, 120)) return "Institution is required";
    if (!isValidString(education.year, 4, 4) || !/^\d{4}$/.test(education.year.trim())) return "Use a 4-digit year";
  }

  if (!Array.isArray(formData?.skills) || formData.skills.length === 0) return "Add at least one skill";

  if (formData?.coverNote !== undefined && typeof formData.coverNote !== "string") return "Cover note must be a string";

  return null;
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
      const cvText = await extractTextFromPDF(file.path);

      if (!cvText || cvText.trim().length < 50) {
        res.status(400).json({
          error: "Uploaded PDF text is too short. Please upload a text-based PDF or use CV builder.",
        });
        return;
      }

      const cv = await CandidateCVRepository.create({
        candidateId,
        name,
        type: "uploaded",
        source: "profile_upload",
        cvUrl: `/uploads/${file.filename}`,
        cvText,
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

      const validationError = validateGeneratedCvData(formData);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const cv = await CandidateCVRepository.create({
        candidateId,
        name: typeof name === "string" && name.trim() ? name.trim() : "Generated CV",
        type: "generated",
        source: "profile_generated",
        formData,
        cvText: CVTextExtractor.assembleFromFormData(formData),
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
