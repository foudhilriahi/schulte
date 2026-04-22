import { Request, Response } from "express";
import { ApplicationRepository } from "../repositories/application.repository";
import { OfferRepository } from "../repositories/offer.repository";
import { CandidateCVRepository } from "../repositories/candidate-cv.repository";
import { analyseApplication } from "../services/ai.service";
import { SocketService } from "../services/socket.service";
import { appEmitter } from "../events/emitter";
import logger from "../utils/logger";
import type { ApplicationStatus } from "@prisma/client";

export class ApplicationsController {
  private static normalizeStatus(status: unknown): ApplicationStatus | null {
    if (status === "review") return "reviewing";
    if (status === "new" || status === "reviewing" || status === "interview" || status === "accepted" || status === "rejected") {
      return status;
    }
    return null;
  }

  // GET /api/applications/mine (candidate)
  static async getMine(req: Request, res: Response): Promise<void> {
    try {
      const apps = await ApplicationRepository.findByCandidate(
        req.user!.userId,
      );
      res.json(apps);
    } catch (err: any) {
      logger.error("Get my applications error:", err);
      res.status(500).json({ error: "Echec de la recuperation des candidatures" });
    }
  }

  // GET /api/applications/by-site (HR — site-scoped)
  static async getBySite(req: Request, res: Response): Promise<void> {
    try {
      const site = req.user!.site;
      if (!site) {
        res.status(400).json({ error: "L'utilisateur RH doit etre associe a un site" });
        return;
      }
      const apps = await ApplicationRepository.findAllBySite(site);
      res.json(apps);
    } catch (err: any) {
      logger.error("Get applications by site error:", err);
      res.status(500).json({ error: "Echec de la recuperation des candidatures" });
    }
  }

  // GET /api/applications/:id
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const app = await ApplicationRepository.findById(req.params.id as string);
      if (!app) {
        res.status(404).json({ error: "Candidature introuvable" });
        return;
      }
      res.json(app);
    } catch (err: any) {
      logger.error("Get application error:", err);
      res.status(500).json({ error: "Echec de la recuperation de la candidature" });
    }
  }

  // POST /api/applications/from-cv (candidate — apply using an existing saved CV)
  static async submitFromSavedCV(req: Request, res: Response): Promise<void> {
    try {
      const { offerId, cvId, coverNote } = req.body;
      const candidateId = req.user!.userId;

      const offer = await OfferRepository.findById(offerId);
      if (!offer || offer.status !== "open") {
        res.status(400).json({ error: "L'offre est fermee ou introuvable" });
        return;
      }

      const existing = await ApplicationRepository.checkDuplicate(candidateId, offerId);
      if (existing) {
        res.status(409).json({ error: "Vous avez deja postule a cette offre" });
        return;
      }

      const selectedCV = await CandidateCVRepository.findByIdForCandidate(candidateId, cvId);
      if (!selectedCV) {
        res.status(404).json({ error: "CV selectionne introuvable" });
        return;
      }

      const cvUrl = selectedCV.cvUrl || undefined;
      const formData = (selectedCV.formData as Record<string, any>) || undefined;
      const cvTemplate = selectedCV.cvTemplate || undefined;
      const cvText = selectedCV.cvText || "";

      if (!cvText || cvText.trim().length < 10) {
        res.status(400).json({ error: "Le CV selectionne ne contient pas de texte exploitable" });
        return;
      }

      const application = await ApplicationRepository.create({
        candidateId,
        offerId,
        candidateCVId: selectedCV.id,
        cvUrl,
        formData,
        cvTemplate,
        cvText,
        cvTextSnapshot: cvText,
        coverNote,
      });

      if (cvText.length > 30) {
        analyseApplication({
          cvText,
          offerTitle: offer.title,
          requiredSkills: offer.requiredSkills || [],
          experienceYears: offer.experienceYears || 0,
          description: offer.description || "",
        })
          .then(async (result) => {
            await ApplicationRepository.saveAIResult(application.id, {
              score: result.score,
              analysis: JSON.stringify({
                ...result,
                analysisDate: new Date().toISOString(),
                cvTextLength: cvText.length,
                analysisType: "saved_cv",
              }),
            });

            SocketService.emitToSite(offer.site, "application:analysed", {
              applicationId: application.id,
              candidateId,
              score: result.score,
              recommendation: result.recommendation,
              confidence: result.confidence,
              aiProvider: result.aiProvider,
              analysisType: "saved_cv",
            });

            SocketService.emitToUser(candidateId, "ai:analysis_complete", {
              applicationId: application.id,
              jobTitle: offer.title,
              score: result.score,
              recommendation: result.recommendation,
              tipsForCandidate: result.tipsForCandidate,
              analysisType: "saved_cv",
            });
          })
          .catch((error) => {
            logger.error(`❌ AI analysis failed for saved CV application ${application.id}:`, error?.message || error);
          });
      }

      SocketService.emitToSite(offer.site, "application:new", application);
      SocketService.emitToAdmin("admin:overview:updated", {
        reason: "application-created",
        applicationId: application.id,
      });

      res.status(201).json(application);
    } catch (err: any) {
      logger.error("Submit application from saved CV error:", err);
      res.status(500).json({ error: "Echec de l'envoi de la candidature depuis le CV selectionne" });
    }
  }

  // PATCH /api/applications/:id/status (HR only)
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, hrNotes, aiScore, aiAnalysis } = req.body;
      const normalizedStatus = ApplicationsController.normalizeStatus(status);

      if (!normalizedStatus) {
        res.status(400).json({
          error: "Statut de candidature invalide",
          allowed: ["new", "reviewing", "interview", "accepted", "rejected"],
        });
        return;
      }

      const extra: Record<string, any> = {};
      if (hrNotes !== undefined) extra.hrNotes = hrNotes;
      if (aiScore !== undefined) extra.aiScore = aiScore;
      if (aiAnalysis !== undefined) extra.aiAnalysis = aiAnalysis;

      const app = await ApplicationRepository.updateStatus(id, normalizedStatus, extra);

      logger.info(`Application ${id} status updated to: ${normalizedStatus}`);

      // Fetch full application with candidate + offer for notification payload
      const fullApp = await ApplicationRepository.findById(id);

      appEmitter.emit("application.statusChanged", {
        applicationId: app.id,
        candidateId: app.candidateId,
        status: app.status,
        candidateName: fullApp?.candidate?.name ?? "",
        candidateEmail: fullApp?.candidate?.email ?? "",
        offerTitle: fullApp?.offer?.title ?? "",
        offerSite: fullApp?.offer?.site ?? "",
      });

      res.json(app);
    } catch (err: any) {
      logger.error("Update application status error:", err);
      res.status(500).json({ error: "Echec de la mise a jour du statut de candidature" });
    }
  }

  // PATCH /api/applications/bulk-status (HR / ADMIN)
  static async bulkUpdateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { ids, status }: { ids: string[]; status: ApplicationStatus } =
        req.body;

      for (const id of ids) {
        await ApplicationRepository.updateStatus(id, status);

        const fullApp = await ApplicationRepository.findById(id);

        appEmitter.emit("application.statusChanged", {
          applicationId: id,
          candidateId: fullApp?.candidateId ?? "",
          status,
          candidateName: fullApp?.candidate?.name ?? "",
          candidateEmail: fullApp?.candidate?.email ?? "",
          offerTitle: fullApp?.offer?.title ?? "",
          offerSite: fullApp?.offer?.site ?? "",
        });
      }

      logger.info(`Bulk status update: ${ids.length} applications → ${status}`);
      res.json({ updated: ids.length });
    } catch (err: any) {
      logger.error("Bulk update status error:", err);
      res
        .status(500)
        .json({ error: "Echec de la mise a jour en lot des statuts de candidature" });
    }
  }

  // PATCH /api/applications/:id/notes
  static async updateNotes(req: Request, res: Response): Promise<void> {
    try {
      const { notes } = req.body;
      const app = await ApplicationRepository.updateNotes(
        req.params.id as string,
        notes,
      );
      res.json(app);
    } catch (err: any) {
      logger.error("Update notes error:", err);
      res.status(500).json({ error: "Echec de la mise a jour des notes" });
    }
  }

  // PATCH /api/applications/:id/rating
  static async updateRating(req: Request, res: Response): Promise<void> {
    try {
      const { rating } = req.body;
      const app = await ApplicationRepository.updateRating(
        req.params.id as string,
        rating,
      );
      res.json(app);
    } catch (err: any) {
      logger.error("Update rating error:", err);
      res.status(500).json({ error: "Echec de la mise a jour de la note" });
    }
  }

  // PATCH /api/applications/:id/tags
  static async updateTags(req: Request, res: Response): Promise<void> {
    try {
      const { tags } = req.body;
      const app = await ApplicationRepository.updateTags(
        req.params.id as string,
        tags,
      );
      res.json(app);
    } catch (err: any) {
      logger.error("Update tags error:", err);
      res.status(500).json({ error: "Echec de la mise a jour des etiquettes" });
    }
  }

  // PATCH /api/applications/:id/analysis
  static async saveAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { aiScore, aiAnalysis } = req.body;

      if (typeof aiScore !== "number" || Number.isNaN(aiScore)) {
        res.status(400).json({ error: "aiScore doit etre un nombre valide" });
        return;
      }

      if (aiAnalysis === undefined || aiAnalysis === null) {
        res.status(400).json({ error: "aiAnalysis est requis" });
        return;
      }

      const updated = await ApplicationRepository.saveAIResult(
        req.params.id as string,
        {
          score: Math.max(0, Math.min(100, Math.round(aiScore))),
          analysis: aiAnalysis,
        },
      );

      res.json(updated);
    } catch (err: any) {
      logger.error("Save merged analysis error:", err);
      res.status(500).json({ error: "Echec de l'enregistrement de l'analyse" });
    }
  }

  // ✅ SMART 3-AI ANALYSIS — PuterJS + Gemini + OpenRouter
  // POST /api/applications/:id/analyse
  static async analyse(req: Request, res: Response): Promise<void> {
    try {
      const app = await ApplicationRepository.findById(req.params.id as string);
      if (!app) {
        res.status(404).json({ error: "Candidature introuvable" });
        return;
      }

      logger.info(`🔍 Analyzing application ${req.params.id}`);
      const cvText = app.cvTextSnapshot || app.candidateCV?.cvText || "";

      logger.info(`📄 Snapshot text length: ${app.cvTextSnapshot?.length || 0}`);
      logger.info(`📎 Saved CV text length: ${app.candidateCV?.cvText?.length || 0}`);

      if (!cvText || cvText.length < 30) {
        logger.error(`❌ Insufficient CV text: ${cvText?.length || 0} characters`);
        res.status(400).json({
          error: "Aucun instantane immuable de CV n'est disponible pour l'analyse.",
          debug: {
            cvTextLength: cvText?.length || 0,
            hasSnapshot: !!app.cvTextSnapshot,
            hasSavedCV: !!app.candidateCV?.cvText,
          }
        });
        return;
      }

      logger.info(`🚀 Starting AI analysis with ${cvText.length} characters of CV text`);

      // Call smart dual-AI service (Gemini + OpenRouter)
      const result = await analyseApplication({
        cvText,
        offerTitle: app.offer?.title || "Unknown Position",
        requiredSkills: app.offer?.requiredSkills || [],
        experienceYears: app.offer?.experienceYears || 0,
        description: app.offer?.description || "",
      });

      logger.info(`✅ AI analysis complete: score ${result.score}, recommendation: ${result.recommendation}`);

      // Save comprehensive AI result to database
      await ApplicationRepository.saveAIResult(req.params.id as string, {
        score: result.score,
        analysis: JSON.stringify({
          ...result,
          analysisDate: new Date().toISOString(),
          cvTextLength: cvText.length,
          analysisType: 'manual_hr'
        }),
      });

      logger.info(
        `🎉 Manual AI analysis complete for application ${req.params.id}: ${result.aiProvider}, score=${result.score}, confidence=${result.confidence}%, language=${result.language}`,
      );

      // Notify via WebSocket about manual analysis completion
      if (app.offer?.site) {
        SocketService.emitToSite(app.offer.site, "application:manual_analysis", {
          applicationId: req.params.id,
          candidateId: app.candidateId,
          score: result.score,
          recommendation: result.recommendation,
          confidence: result.confidence,
          aiProvider: result.aiProvider,
          strengths: result.strengths,
          gaps: result.gaps,
          analysisType: 'manual_hr'
        });

        // Notify candidate about updated analysis
        SocketService.emitToUser(app.candidateId, "ai:analysis_updated", {
          applicationId: req.params.id,
          jobTitle: app.offer.title,
          score: result.score,
          recommendation: result.recommendation,
          tipsForCandidate: result.tipsForCandidate,
          analysisType: 'manual_hr'
        });
      }

      res.json(result);
    } catch (err: any) {
      logger.error("Smart AI analysis error:", err);
      const status = err.status || 503;
      res
        .status(status)
        .json({ error: err.message || "Analyse IA indisponible" });
    }
  }
}
