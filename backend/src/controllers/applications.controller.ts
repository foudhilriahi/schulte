import { Request, Response } from "express";
import { ApplicationRepository } from "../repositories/application.repository";
import { OfferRepository } from "../repositories/offer.repository";
import { UserRepository } from "../repositories/user.repository";
import { extractTextFromPDF, extractEmail } from "../services/upload.service";
import { analyseApplication, CVTextExtractor } from "../services/ai.service";
import { SocketService } from "../services/socket.service";
import { appEmitter } from "../events/emitter";
import logger from "../utils/logger";
import prisma from "../config/prisma";
import fs from "fs";
import type { ApplicationStatus } from "@prisma/client";

export class ApplicationsController {
  // GET /api/applications/mine (candidate)
  static async getMine(req: Request, res: Response): Promise<void> {
    try {
      const apps = await ApplicationRepository.findByCandidate(
        req.user!.userId,
      );
      res.json(apps);
    } catch (err: any) {
      logger.error("Get my applications error:", err);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  }

  // GET /api/applications/by-site (HR — site-scoped)
  static async getBySite(req: Request, res: Response): Promise<void> {
    try {
      const site = req.user!.site;
      if (!site) {
        res.status(400).json({ error: "HR user must have a site assigned" });
        return;
      }
      const apps = await ApplicationRepository.findAllBySite(site);
      res.json(apps);
    } catch (err: any) {
      logger.error("Get applications by site error:", err);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  }

  // GET /api/applications/:id
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const app = await ApplicationRepository.findById(req.params.id as string);
      if (!app) {
        res.status(404).json({ error: "Application not found" });
        return;
      }
      res.json(app);
    } catch (err: any) {
      logger.error("Get application error:", err);
      res.status(500).json({ error: "Failed to fetch application" });
    }
  }

  // POST /api/applications (candidate — PDF upload with smart text extraction)
  static async submitWithCV(req: Request, res: Response): Promise<void> {
    try {
      const { offerId, coverNote } = req.body;
      const candidateId = req.user!.userId;

      // Check offer exists and is open
      const offer = await OfferRepository.findById(offerId);
      if (!offer || offer.status !== "open") {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: "Offer is closed or not found" });
        return;
      }

      // Check duplicate
      const existing = await ApplicationRepository.checkDuplicate(
        candidateId,
        offerId,
      );
      if (existing) {
        if (req.file) fs.unlinkSync(req.file.path);
        res
          .status(409)
          .json({ error: "You have already applied to this offer" });
        return;
      }

      let cvUrl: string | undefined;
      let cvText: string | undefined;

      if (req.file) {
        cvUrl = `/uploads/${req.file.filename}`;

        // Smart PDF text extraction
        try {
          logger.info(`📄 Starting PDF text extraction for ${req.file.filename}`);
          const fileBuffer = fs.readFileSync(req.file.path);
          const base64Data = fileBuffer.toString('base64');
          
          logger.info(`📄 File read successfully, size: ${fileBuffer.length} bytes, base64: ${base64Data.length} chars`);
          
          // Use smart CV text extractor
          cvText = await CVTextExtractor.extractFromPDF(base64Data);
          
          logger.info(`✅ PDF extraction completed: ${cvText.length} characters extracted`);
          logger.info(`📝 First 200 chars: ${cvText.substring(0, 200)}`);

          // Try to extract email from CV text
          if (cvText && cvText.length > 50) {
            const email = extractEmail(cvText);
            if (email) {
              await UserRepository.update(candidateId, { email });
              logger.info(`📧 Email extracted from CV: ${email}`);
            }
          }
        } catch (error) {
          logger.error(`❌ Smart PDF extraction failed for ${req.file.filename}:`, error);
          // Fallback to old method
          try {
            const text = await extractTextFromPDF(req.file.path);
            cvText = text;
            logger.info(`✅ Fallback extraction succeeded: ${cvText?.length || 0} chars`);
          } catch (fallbackError) {
            logger.error(`❌ Fallback PDF extraction also failed:`, fallbackError);
            const fileSize = req.file ? fs.statSync(req.file.path).size : 0;
            cvText = `[PDF uploaded but text extraction failed. File: ${req.file.filename}, Size: ${fileSize} bytes. Manual review required.]`;
          }
        }
      }

      // Ensure we have some CV text
      if (!cvText || cvText.length < 10) {
        logger.warn(`⚠️ No CV text extracted, using placeholder`);
        cvText = `[CV file uploaded: ${req.file?.filename || 'unknown'}. Text extraction pending or failed. Manual review required.]`;
      }

      const application = await ApplicationRepository.create({
        candidateId,
        offerId,
        cvUrl,
        cvText,
        coverNote,
      });

      logger.info(
        `✅ Application created: ${candidateId} -> ${offer.title} (${offer.site}), CV text: ${cvText.length} chars`,
      );

      // Trigger automatic AI analysis in background
      if (cvText && cvText.length > 30) {
        logger.info(`🤖 Triggering automatic AI analysis for application ${application.id}`);
        
        // Run AI analysis asynchronously (don't wait for it)
        analyseApplication({
          cvText,
          offerTitle: offer.title,
          requiredSkills: offer.requiredSkills || [],
          experienceYears: offer.experienceYears || 0,
          description: offer.description || "",
        })
          .then(async (result) => {
            // Save comprehensive AI result to database
            await ApplicationRepository.saveAIResult(application.id, {
              score: result.score,
              analysis: JSON.stringify({
                ...result,
                analysisDate: new Date().toISOString(),
                cvTextLength: cvText.length,
                analysisType: 'automatic_upload'
              }),
            });
            logger.info(`✅ Automatic AI analysis complete for ${application.id}: score ${result.score} (${result.aiProvider})`);
            
            // Notify HR via WebSocket with detailed results
            SocketService.emitToSite(offer.site, "application:analysed", {
              applicationId: application.id,
              candidateId: candidateId,
              score: result.score,
              recommendation: result.recommendation,
              confidence: result.confidence,
              aiProvider: result.aiProvider,
              strengths: result.strengths,
              gaps: result.gaps,
              analysisType: 'automatic_upload'
            });

            // Notify candidate via WebSocket
            SocketService.emitToUser(candidateId, "ai:analysis_complete", {
              applicationId: application.id,
              jobTitle: offer.title,
              score: result.score,
              recommendation: result.recommendation,
              tipsForCandidate: result.tipsForCandidate,
              analysisType: 'automatic_upload'
            });
          })
          .catch((error) => {
            logger.error(`❌ Automatic AI analysis failed for ${application.id}:`, error.message);
            
            // Notify about analysis failure
            SocketService.emitToSite(offer.site, "application:analysis_failed", {
              applicationId: application.id,
              candidateId: candidateId,
              error: error.message,
              analysisType: 'automatic_upload'
            });
          });
      } else {
        logger.warn(`⚠️ Skipping AI analysis - insufficient CV text (${cvText?.length || 0} chars)`);
      }

      SocketService.emitToSite(offer.site, "application:new", application);
      SocketService.emitToAdmin('admin:overview:updated', { reason: 'application-created', applicationId: application.id });

      res.status(201).json(application);
    } catch (err: any) {
      logger.error("Submit application error:", err);
      res.status(500).json({ error: "Failed to submit application" });
    }
  }

  // POST /api/applications/form (candidate — manual form with smart text assembly)
  static async submitWithForm(req: Request, res: Response): Promise<void> {
    try {
      const { offerId, formData } = req.body;
      const candidateId = req.user!.userId;

      const offer = await OfferRepository.findById(offerId);
      if (!offer || offer.status !== "open") {
        res.status(400).json({ error: "Offer is closed or not found" });
        return;
      }

      const existing = await ApplicationRepository.checkDuplicate(
        candidateId,
        offerId,
      );
      if (existing) {
        res
          .status(409)
          .json({ error: "You have already applied to this offer" });
        return;
      }

      logger.info(`📝 Assembling CV text from form data...`);
      logger.info(`📝 Form data keys: ${Object.keys(formData || {}).join(', ')}`);

      // Smart text assembly from form data
      const cvText = CVTextExtractor.assembleFromFormData(formData);

      logger.info(`✅ Form text assembled: ${cvText.length} characters`);
      logger.info(`📝 First 200 chars: ${cvText.substring(0, 200)}`);

      if (!cvText || cvText.length < 30) {
        logger.warn(`⚠️ Form data produced insufficient text (${cvText.length} chars)`);
        res.status(400).json({ 
          error: "Form data incomplete. Please fill all required fields." 
        });
        return;
      }

      const application = await ApplicationRepository.create({
        candidateId,
        offerId,
        formData,
        cvText, // Store assembled text for AI analysis
      });

      logger.info(`✅ Form application created: ${candidateId} -> ${offer.title}, CV text: ${cvText.length} chars`);

      // Trigger automatic AI analysis in background
      if (cvText && cvText.length > 30) {
        logger.info(`🤖 Triggering automatic AI analysis for application ${application.id}`);
        
        // Run AI analysis asynchronously (don't wait for it)
        analyseApplication({
          cvText,
          offerTitle: offer.title,
          requiredSkills: offer.requiredSkills || [],
          experienceYears: offer.experienceYears || 0,
          description: offer.description || "",
        })
          .then(async (result) => {
            // Save comprehensive AI result to database
            await ApplicationRepository.saveAIResult(application.id, {
              score: result.score,
              analysis: JSON.stringify({
                ...result,
                analysisDate: new Date().toISOString(),
                cvTextLength: cvText.length,
                analysisType: 'automatic_form'
              }),
            });
            logger.info(`✅ Automatic AI analysis complete for ${application.id}: score ${result.score} (${result.aiProvider})`);
            
            // Notify HR via WebSocket with detailed results
            SocketService.emitToSite(offer.site, "application:analysed", {
              applicationId: application.id,
              candidateId: candidateId,
              score: result.score,
              recommendation: result.recommendation,
              confidence: result.confidence,
              aiProvider: result.aiProvider,
              strengths: result.strengths,
              gaps: result.gaps,
              analysisType: 'automatic_form'
            });

            // Notify candidate via WebSocket
            SocketService.emitToUser(candidateId, "ai:analysis_complete", {
              applicationId: application.id,
              jobTitle: offer.title,
              score: result.score,
              recommendation: result.recommendation,
              tipsForCandidate: result.tipsForCandidate,
              analysisType: 'automatic_form'
            });
          })
          .catch((error) => {
            logger.error(`❌ Automatic AI analysis failed for ${application.id}:`, error.message);
            
            // Notify about analysis failure
            SocketService.emitToSite(offer.site, "application:analysis_failed", {
              applicationId: application.id,
              candidateId: candidateId,
              error: error.message,
              analysisType: 'automatic_form'
            });
          });
      } else {
        logger.warn(`⚠️ Skipping AI analysis - insufficient CV text (${cvText?.length || 0} chars)`);
      }

      SocketService.emitToSite(offer.site, "application:new", application);
      SocketService.emitToAdmin('admin:overview:updated', { reason: 'application-created', applicationId: application.id });

      res.status(201).json(application);
    } catch (err: any) {
      logger.error("Submit form application error:", err);
      res.status(500).json({ error: "Failed to submit application" });
    }
  }

  // PATCH /api/applications/:id/status (HR only)
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, hrNotes, aiScore, aiAnalysis } = req.body;

      const extra: Record<string, any> = {};
      if (hrNotes !== undefined) extra.hrNotes = hrNotes;
      if (aiScore !== undefined) extra.aiScore = aiScore;
      if (aiAnalysis !== undefined) extra.aiAnalysis = aiAnalysis;

      const app = await ApplicationRepository.updateStatus(id, status, extra);

      logger.info(`Application ${id} status updated to: ${status}`);

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
      res.status(500).json({ error: "Failed to update application status" });
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
        .json({ error: "Failed to bulk update application statuses" });
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
      res.status(500).json({ error: "Failed to update notes" });
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
      res.status(500).json({ error: "Failed to update rating" });
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
      res.status(500).json({ error: "Failed to update tags" });
    }
  }

  // ✅ SMART 3-AI ANALYSIS — PuterJS + Gemini + OpenRouter
  // POST /api/applications/:id/analyse
  static async analyse(req: Request, res: Response): Promise<void> {
    try {
      const app = await ApplicationRepository.findById(req.params.id as string);
      if (!app) {
        res.status(404).json({ error: "Application not found" });
        return;
      }

      logger.info(`🔍 Analyzing application ${req.params.id}`);
      logger.info(`📄 Current cvText length: ${app.cvText?.length || 0}`);
      logger.info(`📋 Has formData: ${!!app.formData}`);
      logger.info(`📎 Has cvUrl: ${!!app.cvUrl}`);

      // Smart CV text preparation
      let cvText = app.cvText || "";
      
      // If no CV text but we have form data, assemble it
      if (!cvText && app.formData) {
        logger.info(`📝 No cvText found, assembling from formData...`);
        cvText = CVTextExtractor.assembleFromFormData(app.formData as Record<string, any>);
        logger.info(`✅ Assembled ${cvText.length} characters from form data`);
        
        // Save the assembled text back to database
        if (cvText && cvText.length > 30) {
          await prisma.application.update({
            where: { id: req.params.id as string },
            data: { cvText }
          });
          logger.info(`💾 Saved assembled text to database`);
        }
      }

      // If still no text, try to extract from PDF if available
      if ((!cvText || cvText.length < 30) && app.cvUrl) {
        logger.info(`📄 Attempting to extract text from PDF: ${app.cvUrl}`);
        try {
          // Try multiple path variations
          const possiblePaths = [
            `backend/uploads/${app.cvUrl.replace('/uploads/', '')}`,
            `uploads/${app.cvUrl.replace('/uploads/', '')}`,
            app.cvUrl.replace('/uploads/', 'backend/uploads/'),
            app.cvUrl.replace('/uploads/', 'uploads/')
          ];
          
          let fileBuffer: Buffer | null = null;
          let usedPath = '';
          
          for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath)) {
              fileBuffer = fs.readFileSync(filePath);
              usedPath = filePath;
              logger.info(`✅ Found file at: ${filePath}`);
              break;
            } else {
              logger.info(`❌ File not found at: ${filePath}`);
            }
          }
          
          if (fileBuffer) {
            const base64Data = fileBuffer.toString('base64');
            cvText = await CVTextExtractor.extractFromPDF(base64Data);
            logger.info(`✅ Extracted ${cvText.length} characters from PDF`);
            
            // Save extracted text to database
            if (cvText && cvText.length > 30) {
              await prisma.application.update({
                where: { id: req.params.id as string },
                data: { cvText }
              });
              logger.info(`💾 Saved extracted text to database`);
            }
          } else {
            logger.error(`❌ Could not find PDF file at any expected location`);
          }
        } catch (error) {
          logger.error(`❌ Failed to extract text from ${app.cvUrl}:`, error);
        }
      }

      if (!cvText || cvText.length < 30) {
        logger.error(`❌ Insufficient CV text: ${cvText?.length || 0} characters`);
        res.status(400).json({
          error: "No CV text available for analysis. Upload a readable PDF or fill the form completely.",
          debug: {
            cvTextLength: cvText?.length || 0,
            hasFormData: !!app.formData,
            hasCvUrl: !!app.cvUrl,
            cvUrl: app.cvUrl
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
        .json({ error: err.message || "AI analysis unavailable" });
    }
  }
}
