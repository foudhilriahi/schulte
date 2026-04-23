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

const textPattern = /^[A-Za-zÀ-ÿ0-9'.,\-\s\n\r:;?!()]{2,2000}$/;
const linkPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

const isValidString = (value: unknown, minLength = 1, maxLength = 200, pattern?: RegExp) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) return false;
  if (pattern && !pattern.test(trimmed)) return false;
  return true;
};

const validateGeneratedCvData = (formData: any): string | null => {
  const personal = formData?.personal;

  if (!personal || typeof personal !== "object") return "Les informations personnelles sont requises";
  if (!isValidString(personal.name, 2, 80, namePattern)) return "Entrez un nom complet valide (lettres uniquement)";
  if (!isValidString(personal.email, 5, 120, emailPattern)) return "Entrez une adresse e-mail valide";
  if (!isValidString(personal.phone, 8, 20, phonePattern)) return "Entrez un numero de telephone valide";
  if (!isValidString(personal.city, 1, 80) || !tunisianCities.has(personal.city.trim())) return "Selectionnez une ville tunisienne valide";

  if (!Array.isArray(formData?.education) || formData.education.length === 0 || formData.education.length > 15) return "Ajoutez entre 1 et 15 formations";
  for (const education of formData.education) {
    if (!education || typeof education !== "object") return "Les informations de formation sont invalides";
    if (!isValidString(education.degree, 1, 60) || !degreeOptions.has(education.degree.trim())) return "Selectionnez un diplome valide";
    if (!isValidString(education.field, 2, 100)) return "Le domaine d'etudes est invalide";
    if (!isValidString(education.institution, 2, 150)) return "L'etablissement est invalide";
    if (!isValidString(education.year, 4, 4) || !/^\d{4}$/.test(education.year.trim())) return "Utilisez une annee sur 4 chiffres";
  }

  if (Array.isArray(formData?.experience)) {
    if (formData.experience.length > 20) return "Maximum 20 experiences autorisees";
    for (const exp of formData.experience) {
      if (!isValidString(exp.title, 2, 100)) return "Titre de poste invalide";
      if (!isValidString(exp.company, 2, 150)) return "Nom d'entreprise invalide";
      if (!isValidString(exp.duration, 2, 100)) return "Duree invalide";
      if (exp.description && !isValidString(exp.description, 2, 1000, textPattern)) return "Description d'experience invalide (caracteres non autorises ou trop longue)";
    }
  }

  if (!Array.isArray(formData?.skills) || formData.skills.length === 0 || formData.skills.length > 40) return "Ajoutez entre 1 et 40 competences";
  for (const skill of formData.skills) {
    if (!isValidString(skill, 2, 60)) return "Une ou plusieurs competences sont invalides";
  }

  if (Array.isArray(formData?.languages)) {
    if (formData.languages.length > 10) return "Maximum 10 langues autorisees";
    for (const lang of formData.languages) {
      if (!isValidString(lang.name, 2, 50)) return "Nom de langue invalide";
      if (!isValidString(lang.level, 2, 50)) return "Niveau de langue invalide";
    }
  }

  if (Array.isArray(formData?.links)) {
    if (formData.links.length > 5) return "Maximum 5 liens autorises";
    for (const link of formData.links) {
      if (!isValidString(link.name, 2, 50)) return "Nom de lien invalide";
      if (!isValidString(link.url, 5, 300, linkPattern)) return "URL invalide";
    }
  }

  if (formData?.coverNote !== undefined && formData.coverNote !== "") {
    if (!isValidString(formData.coverNote, 2, 1500, textPattern)) return "La note de motivation contient des caracteres invalides ou est trop longue";
  }

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
      res.status(500).json({ error: "Echec de la recuperation des CV" });
    }
  }

  static async upload(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "Le fichier CV est requis" });
        return;
      }

      const name = file.originalname.replace(/\.pdf$/i, "").trim() || "Uploaded CV";
      const cvText = await extractTextFromPDF(file.path);

      if (!cvText || cvText.trim().length < 50) {
        res.status(400).json({
          error: "Le texte du PDF televerse est trop court. Televersez un PDF textuel ou utilisez le generateur de CV.",
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
      res.status(500).json({ error: "Echec du televersement du CV" });
    }
  }

  static async createGenerated(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const { name, formData, template, isDefault } = req.body;

      if (!formData || typeof formData !== "object") {
        res.status(400).json({ error: "formData est requis" });
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
      res.status(500).json({ error: "Echec de la creation du CV genere" });
    }
  }

  static async setDefault(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const cvId = req.params.id as string;
      const cv = await CandidateCVRepository.setDefault(candidateId, cvId);

      if (!cv) {
        res.status(404).json({ error: "CV introuvable" });
        return;
      }

      res.json(cv);
    } catch (err) {
      logger.error("Set default CV error:", err);
      res.status(500).json({ error: "Echec de la definition du CV par defaut" });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const candidateId = req.user!.userId;
      const cvId = req.params.id as string;
      const removed = await CandidateCVRepository.delete(candidateId, cvId);

      if (!removed) {
        res.status(404).json({ error: "CV introuvable" });
        return;
      }

      res.status(204).send();
    } catch (err) {
      logger.error("Delete CV error:", err);
      res.status(500).json({ error: "Echec de la suppression du CV" });
    }
  }
}
