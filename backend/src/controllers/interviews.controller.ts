import { Request, Response } from "express";
import prisma from "../config/prisma";
import { appEmitter } from "../events/emitter";
import { InterviewRepository } from "../repositories/interview.repository";
import logger from "../utils/logger";

export class InterviewsController {
  // GET /api/interviews
  static async getInterviews(req: Request, res: Response): Promise<void> {
    try {
      const { role, site } = req.user!;

      let interviews;
      if (role === "ADMIN") {
        interviews = await prisma.interview.findMany({
          include: {
            application: { include: { candidate: true, offer: true } },
          },
          orderBy: { scheduledAt: "asc" },
        });
      } else if (role === "HR") {
        interviews = await prisma.interview.findMany({
          where: { application: { offer: { site: site as any } } },
          include: {
            application: { include: { candidate: true, offer: true } },
          },
          orderBy: { scheduledAt: "asc" },
        });
      } else {
        // CANDIDATE
        interviews = await prisma.interview.findMany({
          where: { application: { candidateId: req.user!.userId } },
          include: { application: { include: { offer: true } } },
          orderBy: { scheduledAt: "asc" },
        });
      }

      res.json(interviews);
    } catch (err: any) {
      logger.error("Get interviews error:", err);
      res.status(500).json({ error: "Failed to fetch interviews" });
    }
  }

  // POST /api/interviews
  static async scheduleInterview(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId, scheduledAt, location, type, notes } = req.body;

      // Validate scheduledAt
      const interviewDate = new Date(scheduledAt);
      if (isNaN(interviewDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
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
          },
          include: {
            application: {
              include: { candidate: true, offer: true },
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
              include: { candidate: true, offer: true },
            },
          },
        });
        logger.info(`Interview created for application ${applicationId}`);
      }

      // Update application status to 'interview'
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "interview" },
      });

      // Emit event — NotificationService listener handles socket + email
      appEmitter.emit("interview.scheduled", {
        interviewId: interview.id,
        applicationId,
        candidateId: interview.application.candidateId,
        candidateName: interview.application.candidate.name,
        candidateEmail: interview.application.candidate.email ?? "",
        offerTitle: interview.application.offer.title,
        scheduledAt: interview.scheduledAt,
        location: interview.location,
        notes: interview.notesForCandidate ?? undefined,
      });

      res.status(201).json(interview);
    } catch (err: any) {
      logger.error("Schedule interview error:", err);
      res.status(500).json({ error: "Failed to schedule interview" });
    }
  }

  // PATCH /api/interviews/:id/outcome
  static async markOutcome(req: Request, res: Response): Promise<void> {
    try {
      const { outcome } = req.body;
      const interview = await InterviewRepository.markOutcome(
        req.params.id as string,
        outcome as "pass" | "fail" | "no_show",
      );
      res.json(interview);
    } catch (err: any) {
      logger.error("Mark interview outcome error:", err);
      res.status(500).json({ error: "Failed to mark interview outcome" });
    }
  }
}
