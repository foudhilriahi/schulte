import { Request, Response } from "express";
import prisma from "../config/prisma";
import { appEmitter } from "../events/emitter";
import { ApplicationRepository } from "../repositories/application.repository";
import { InterviewRepository } from "../repositories/interview.repository";
import logger from "../utils/logger";
import { SocketService } from "../services/socket.service";

export class InterviewsController {
  private static parseLimit(raw: unknown, max = 100): number | undefined {
    const value = Number(raw);
    if (!Number.isFinite(value)) return undefined;
    return Math.min(Math.max(Math.trunc(value), 1), max);
  }

  private static parseCursorDate(raw: unknown): Date | undefined {
    if (typeof raw !== "string" || raw.trim().length === 0) return undefined;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed;
  }

  private static readonly candidateSafeSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    skills: true,
    experience: true,
    city: true,
    role: true,
    site: true,
    cvUrl: true,
    createdAt: true,
    updatedAt: true,
    emailVerified: true,
    isActive: true,
  } as const;

  private static buildWhereWithCursor(baseWhere: Record<string, any>, cursor?: Date) {
    if (!cursor) return baseWhere;
    return {
      ...baseWhere,
      scheduledAt: { gt: cursor },
    };
  }

  // GET /api/interviews
  static async getInterviews(req: Request, res: Response): Promise<void> {
    try {
      const { role, site } = req.user!;
      const pageSize = InterviewsController.parseLimit(req.query.limit, 100);
      const cursor = InterviewsController.parseCursorDate(req.query.cursor);

      let interviews;
      if (role === "ADMIN") {
        interviews = await prisma.interview.findMany({
          where: InterviewsController.buildWhereWithCursor({}, cursor),
          ...(pageSize ? { take: pageSize } : {}),
          include: {
            application: {
              include: {
                candidate: { select: InterviewsController.candidateSafeSelect },
                offer: true,
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        });
      } else if (role === "HR") {
        interviews = await prisma.interview.findMany({
          where: InterviewsController.buildWhereWithCursor(
            { application: { offer: { site: site as any } } },
            cursor,
          ),
          ...(pageSize ? { take: pageSize } : {}),
          include: {
            application: {
              include: {
                candidate: { select: InterviewsController.candidateSafeSelect },
                offer: true,
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        });
      } else {
        // CANDIDATE
        interviews = await prisma.interview.findMany({
          where: InterviewsController.buildWhereWithCursor(
            { application: { candidateId: req.user!.userId } },
            cursor,
          ),
          ...(pageSize ? { take: pageSize } : {}),
          include: { application: { include: { offer: true } } },
          orderBy: { scheduledAt: "asc" },
        });
      }

      res.json(interviews);
    } catch (err: any) {
      logger.error("Get interviews error:", err);
      res.status(500).json({ error: "Echec de la recuperation des entretiens" });
    }
  }

  // POST /api/interviews
  static async scheduleInterview(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, scheduledAt, location, type, notes } = req.body;

      // Validate scheduledAt
      const interviewDate = new Date(scheduledAt);
      if (isNaN(interviewDate.getTime())) {
        res.status(400).json({ error: "Format de date invalide" });
        return;
      }

      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          candidate: { select: InterviewsController.candidateSafeSelect },
          offer: true,
        },
      });

      if (!application) {
        res.status(404).json({ error: "Candidature introuvable" });
        return;
      }

      if (req.user?.role === "HR") {
        if (!req.user.site) {
          res.status(400).json({ error: "L'utilisateur RH doit etre associe a un site" });
          return;
        }
        if (application.offer.site !== req.user.site) {
          res.status(403).json({ error: "Vous ne pouvez pas planifier un entretien hors de votre site" });
          return;
        }
      }

      if (application.status === "accepted" || application.status === "rejected") {
        res.status(409).json({
          error: "Impossible de planifier un entretien pour une candidature deja finalisee",
        });
        return;
      }

      // Check if interview already exists for this application
      const existingInterview = await prisma.interview.findUnique({
        where: { applicationId },
      });

      let interview;
      if (existingInterview) {
        // Update existing interview
        interview = await prisma.interview.update({
          where: { applicationId },
          data: {
            scheduledAt: interviewDate,
            location,
            type: type || "on-site",
            notesForCandidate: notes || "",
            outcome: null,
            reminderSent: false,
          },
          include: {
            application: {
              include: {
                candidate: { select: InterviewsController.candidateSafeSelect },
                offer: true,
              },
            },
          },
        });
        logger.info(`Interview updated for application ${applicationId}`);
      } else {
        // Create new interview
        interview = await prisma.interview.create({
          data: {
            applicationId,
            scheduledAt: interviewDate,
            location,
            type: type || "on-site",
            notesForCandidate: notes || "",
            createdById: req.user!.userId,
          },
          include: {
            application: {
              include: {
                candidate: { select: InterviewsController.candidateSafeSelect },
                offer: true,
              },
            },
          },
        });
        logger.info(`Interview created for application ${applicationId}`);
      }

      // Update application status to 'interview'
      if (application.status !== "interview") {
        await prisma.application.update({
          where: { id: applicationId },
          data: { status: "interview" },
        });
      }

      // Emit event — NotificationService listener handles socket + email
      appEmitter.emit("interview.scheduled", {
        interviewId: interview.id,
        applicationId,
        candidateId: interview.application.candidateId,
        candidateName: interview.application.candidate.name,
        candidateEmail: interview.application.candidate.email ?? "",
        offerTitle: interview.application.offer.title,
        offerSite: interview.application.offer.site,
        scheduledAt: interview.scheduledAt,
        location: interview.location,
        notes: interview.notesForCandidate ?? undefined,
      });

      SocketService.emitToAdmin('admin:overview:updated', { reason: 'interview-scheduled', interviewId: interview.id });

      res.status(201).json(interview);
    } catch (err: any) {
      logger.error("Schedule interview error:", err);
      res.status(500).json({ error: "Echec de la planification de l'entretien" });
    }
  }

  // PATCH /api/interviews/:id/outcome
  static async markOutcome(req: Request, res: Response): Promise<void> {
    try {
      const { outcome } = req.body;

      if (outcome !== "pass" && outcome !== "fail" && outcome !== "no_show") {
        res.status(400).json({ error: "Resultat d'entretien invalide" });
        return;
      }

      const interviewId = req.params.id as string;
      const existingInterview = await InterviewRepository.findById(interviewId);
      if (!existingInterview) {
        res.status(404).json({ error: "Entretien introuvable" });
        return;
      }

      if (req.user?.role === "HR") {
        if (!req.user.site) {
          res.status(400).json({ error: "L'utilisateur RH doit etre associe a un site" });
          return;
        }
        if (existingInterview.application.offer.site !== req.user.site) {
          res.status(403).json({ error: "Vous ne pouvez pas modifier un entretien hors de votre site" });
          return;
        }
      }

      const interview = await InterviewRepository.markOutcome(interviewId, outcome);

      // Only final outcomes should move the application forward.
      if (outcome === "pass" || outcome === "fail") {
        const nextStatus = outcome === "pass" ? "accepted" : "rejected";

        await ApplicationRepository.updateStatus(interview.applicationId, nextStatus);

        const fullApp = await ApplicationRepository.findById(interview.applicationId);

        appEmitter.emit("application.statusChanged", {
          applicationId: interview.applicationId,
          candidateId: fullApp?.candidate?.id ?? "",
          status: nextStatus,
          candidateName: fullApp?.candidate?.name ?? "",
          candidateEmail: fullApp?.candidate?.email ?? "",
          offerTitle: fullApp?.offer?.title ?? "",
          offerSite: fullApp?.offer?.site ?? "",
        });
      }

      // Auto-reject after second no-show (real-life policy: one reschedule chance).
      if (outcome === "no_show" && interview.noShowCount >= 2) {
        const fullApp = await ApplicationRepository.findById(interview.applicationId);
        const currentStatus = fullApp?.status;

        if (currentStatus !== "accepted" && currentStatus !== "rejected") {
          await ApplicationRepository.updateStatus(interview.applicationId, "rejected");

          appEmitter.emit("application.statusChanged", {
            applicationId: interview.applicationId,
            candidateId: fullApp?.candidate?.id ?? "",
            status: "rejected",
            candidateName: fullApp?.candidate?.name ?? "",
            candidateEmail: fullApp?.candidate?.email ?? "",
            offerTitle: fullApp?.offer?.title ?? "",
            offerSite: fullApp?.offer?.site ?? "",
          });
        }
      }

      SocketService.emitToAdmin("admin:overview:updated", {
        reason: "interview-outcome-updated",
        interviewId,
        outcome,
      });

      res.json(interview);
    } catch (err: any) {
      logger.error("Mark interview outcome error:", err);
      res.status(500).json({ error: "Echec de la mise a jour du resultat de l'entretien" });
    }
  }
}
