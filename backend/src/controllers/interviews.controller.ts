import { Request, Response } from "express";
import type { ApplicationStatus } from "@prisma/client";
import prisma from "../config/prisma";
import { appEmitter } from "../events/emitter";
import { ApplicationRepository } from "../repositories/application.repository";
import { InterviewRepository } from "../repositories/interview.repository";
import logger from "../utils/logger";
import { SocketService } from "../services/socket.service";

type InterviewType = "on-site" | "video" | "phone";

const INTERVIEW_TYPES = new Set<InterviewType>(["on-site", "video", "phone"]);
const FINAL_APPLICATION_STATUSES = new Set<ApplicationStatus>(["accepted", "rejected"]);
const MIN_LOCATION_LENGTH = 3;
const MAX_LOCATION_LENGTH = 160;
const MAX_NOTES_LENGTH = 2000;
const SCHEDULE_MIN_LEAD_MS = 5 * 60 * 1000;
const SCHEDULE_MAX_FUTURE_MS = 366 * 24 * 60 * 60 * 1000;

function createHttpError(statusCode: number, message: string): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

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

  private static sanitizeText(raw: unknown, maxLength: number): string {
    if (typeof raw !== "string") return "";
    return raw.replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  private static parseInterviewType(raw: unknown): InterviewType | null {
    const normalized =
      typeof raw === "string" && raw.trim().length > 0
        ? raw.trim().toLowerCase()
        : "on-site";
    if (INTERVIEW_TYPES.has(normalized as InterviewType)) {
      return normalized as InterviewType;
    }
    return null;
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
      if (typeof applicationId !== "string" || applicationId.trim().length === 0) {
        res.status(400).json({ error: "Candidature invalide" });
        return;
      }

      const normalizedType = InterviewsController.parseInterviewType(type);
      if (!normalizedType) {
        res.status(400).json({ error: "Type d'entretien invalide" });
        return;
      }

      const normalizedLocation = InterviewsController.sanitizeText(location, MAX_LOCATION_LENGTH);
      if (normalizedLocation.length < MIN_LOCATION_LENGTH) {
        res.status(400).json({
          error: "Le lieu ou lien d'entretien est obligatoire (au moins 3 caracteres)",
        });
        return;
      }

      const normalizedNotes = InterviewsController.sanitizeText(notes, MAX_NOTES_LENGTH);

      const interviewDate = new Date(scheduledAt);
      if (Number.isNaN(interviewDate.getTime())) {
        res.status(400).json({ error: "Format de date invalide" });
        return;
      }
      const now = Date.now();
      const scheduledTs = interviewDate.getTime();
      if (scheduledTs < now + SCHEDULE_MIN_LEAD_MS) {
        res.status(400).json({
          error: "La date d'entretien doit etre au moins 5 minutes dans le futur",
        });
        return;
      }
      if (scheduledTs > now + SCHEDULE_MAX_FUTURE_MS) {
        res.status(400).json({
          error: "La date d'entretien est trop lointaine",
        });
        return;
      }

      const { interview, wasCreated } = await prisma.$transaction(async (tx) => {
        const currentApplication = await tx.application.findUnique({
          where: { id: applicationId },
          include: {
            candidate: { select: InterviewsController.candidateSafeSelect },
            offer: true,
          },
        });

        if (!currentApplication) {
          throw createHttpError(404, "Candidature introuvable");
        }

        if (req.user?.role === "HR") {
          if (!req.user.site) {
            throw createHttpError(400, "L'utilisateur RH doit etre associe a un site");
          }
          if (currentApplication.offer.site !== req.user.site) {
            throw createHttpError(403, "Vous ne pouvez pas planifier un entretien hors de votre site");
          }
        }

        if (FINAL_APPLICATION_STATUSES.has(currentApplication.status)) {
          throw createHttpError(
            409,
            "Impossible de planifier un entretien pour une candidature deja finalisee",
          );
        }

        const existingInterview = await tx.interview.findUnique({
          where: { applicationId },
        });

        // STRICT: block reschedule if outcome already set (pass/fail/no_show)
        if (existingInterview?.outcome) {
          throw createHttpError(
            409,
            "Impossible de replanifier un entretien dont le résultat a déjà été enregistré.",
          );
        }

        // STRICT: block reschedule if the existing interview date is in the past and no outcome
        if (
          existingInterview &&
          !existingInterview.outcome &&
          existingInterview.scheduledAt < new Date()
        ) {
          throw createHttpError(
            409,
            "L'entretien précédent est passé sans résultat. Marquez-le absent (no_show) avant de replanifier.",
          );
        }

        const interviewData = {
          scheduledAt: interviewDate,
          location: normalizedLocation,
          type: normalizedType,
          notesForCandidate: normalizedNotes.length > 0 ? normalizedNotes : null,
          outcome: null,
          reminderSent: false,
        };

        const savedInterview = existingInterview
          ? await tx.interview.update({
              where: { applicationId },
              data: interviewData,
              include: {
                application: {
                  include: {
                    candidate: { select: InterviewsController.candidateSafeSelect },
                    offer: true,
                  },
                },
              },
            })
          : await tx.interview.create({
              data: {
                applicationId,
                createdById: req.user!.userId,
                ...interviewData,
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

        if (currentApplication.status !== "interview") {
          await tx.application.update({
            where: { id: applicationId },
            data: { status: "interview" },
          });
        }

        return { interview: savedInterview, wasCreated: !existingInterview };
      });

      logger.info(
        `${wasCreated ? "Interview created" : "Interview updated"} for application ${applicationId}`,
      );

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

      SocketService.emitToAdmin("admin:overview:updated", {
        reason: "interview-scheduled",
        interviewId: interview.id,
      });

      res.status(wasCreated ? 201 : 200).json(interview);
    } catch (err: any) {
      if (typeof err?.statusCode === "number") {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
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

      if (existingInterview.outcome === outcome) {
        // Stable no-op for retries to avoid duplicate no-show increments.
        res.json(existingInterview);
        return;
      }

      const updated = await prisma.$transaction(async (tx) => {
        const interview = await tx.interview.findUnique({
          where: { id: interviewId },
          include: {
            application: {
              include: {
                candidate: { select: InterviewsController.candidateSafeSelect },
                offer: true,
              },
            },
          },
        });

        if (!interview) {
          throw createHttpError(404, "Entretien introuvable");
        }

        if (FINAL_APPLICATION_STATUSES.has(interview.application.status)) {
          const allowedOutcome = interview.application.status === "accepted" ? "pass" : "fail";
          if (outcome !== allowedOutcome) {
            throw createHttpError(
              409,
              "Impossible de modifier le resultat d'un entretien lie a une candidature finalisee",
            );
          }
        }

        const noShowIncrement = outcome === "no_show" && interview.outcome !== "no_show";
        const updatedInterview = await tx.interview.update({
          where: { id: interviewId },
          data: {
            outcome,
            ...(noShowIncrement ? { noShowCount: { increment: 1 } } : {}),
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

        let finalStatus: ApplicationStatus | null = null;
        if (outcome === "pass" || outcome === "fail") {
          const nextStatus: ApplicationStatus = outcome === "pass" ? "accepted" : "rejected";
          if (updatedInterview.application.status !== nextStatus) {
            await tx.application.update({
              where: { id: updatedInterview.applicationId },
              data: { status: nextStatus },
            });
            finalStatus = nextStatus;
          }
        }

        if (
          outcome === "no_show" &&
          noShowIncrement &&
          updatedInterview.noShowCount >= 2 &&
          !FINAL_APPLICATION_STATUSES.has(updatedInterview.application.status)
        ) {
          await tx.application.update({
            where: { id: updatedInterview.applicationId },
            data: { status: "rejected" },
          });
          finalStatus = "rejected";
        }

        return {
          interview: updatedInterview,
          finalStatus,
          previousOutcome: interview.outcome,
        };
      });

      // Only final outcomes should move the application forward.
      if (updated.finalStatus) {
        const fullApp = await ApplicationRepository.findById(updated.interview.applicationId);
        appEmitter.emit("application.statusChanged", {
          applicationId: updated.interview.applicationId,
          candidateId: fullApp?.candidate?.id ?? "",
          status: updated.finalStatus,
          candidateName: fullApp?.candidate?.name ?? "",
          candidateEmail: fullApp?.candidate?.email ?? "",
          offerTitle: fullApp?.offer?.title ?? "",
          offerSite: fullApp?.offer?.site ?? "",
        });
      }

      appEmitter.emit("interview.outcomeChanged", {
        interviewId: updated.interview.id,
        applicationId: updated.interview.applicationId,
        candidateId: updated.interview.application.candidate.id,
        candidateName: updated.interview.application.candidate.name,
        candidateEmail: updated.interview.application.candidate.email ?? "",
        offerTitle: updated.interview.application.offer.title,
        offerSite: updated.interview.application.offer.site,
        outcome,
        previousOutcome: updated.previousOutcome,
        noShowCount: updated.interview.noShowCount,
        scheduledAt: updated.interview.scheduledAt,
        location: updated.interview.location,
      });

      SocketService.emitToAdmin("admin:overview:updated", {
        reason: "interview-outcome-updated",
        interviewId,
        outcome,
      });

      res.json(updated.interview);
    } catch (err: any) {
      if (typeof err?.statusCode === "number") {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      logger.error("Mark interview outcome error:", err);
      res.status(500).json({ error: "Echec de la mise a jour du resultat de l'entretien" });
    }
  }
}
