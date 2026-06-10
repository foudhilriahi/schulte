import cron from 'node-cron';
import { InterviewRepository } from '../repositories/interview.repository';
import { OfferRepository } from '../repositories/offer.repository';
import { appEmitter } from '../events/emitter';
import { SocketService } from './socket.service';
import logger from '../utils/logger';
import prisma from '../config/prisma';

/**
 * Registers and starts all scheduled cron jobs.
 * Must be called once during server startup.
 */
export function startCronJobs(): void {
  // ── Daily 08:00 — send interview reminders for tomorrow's interviews ────────
  cron.schedule('0 8 * * *', async () => {
    try {
      logger.info('[CronService] Running daily interview reminder job...');

      const interviews = await InterviewRepository.findTomorrow();

      if (interviews.length === 0) {
        logger.info('[CronService] No interviews scheduled for tomorrow.');
        return;
      }

      logger.info(`[CronService] Sending reminders for ${interviews.length} interview(s).`);

      for (const interview of interviews) {
        const candidate = interview.application.candidate;
        const offer     = interview.application.offer;

        appEmitter.emit('interview.reminder', {
          interviewId:    interview.id,
          candidateId:    candidate.id,
          candidateName:  candidate.name,
          candidateEmail: candidate.email ?? '',
          offerTitle:     offer.title,
          offerSite:      offer.site,
          scheduledAt:    interview.scheduledAt,
          location:       interview.location,
        });

        // Also mark reminderSent so we don't double-fire if cron overlaps
        await prisma.interview.update({
          where: { id: interview.id },
          data: { reminderSent: true },
        });
      }
    } catch (err) {
      logger.error('[CronService] Daily interview reminder job failed:', err);
    }
  });

  // ── Every hour — auto-close expired job offers ────────────────────────────
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('[CronService] Running auto-close expired offers job...');

      const now = new Date();
      
      // Find all open offers with deadline passed
      const expiredOffers = await prisma.jobOffer.findMany({
        where: {
          status: 'open',
          deadline: {
            lt: now
          }
        }
      });

      if (expiredOffers.length === 0) {
        logger.info('[CronService] No expired offers to close.');
        return;
      }

      logger.info(`[CronService] Auto-closing ${expiredOffers.length} expired offer(s)...`);

      // Close all expired offers
      for (const offer of expiredOffers) {
        await prisma.jobOffer.update({
          where: { id: offer.id },
          data: { status: 'closed' }
        });

        logger.info(`[CronService] Auto-closed offer: ${offer.title} (${offer.site}) - deadline was ${offer.deadline.toISOString()}`);

        // Notify all candidates that this offer is now closed
        SocketService.emitToAllCandidates('offer:closed', { id: offer.id });
        
        // Notify HR for this site
        SocketService.emitToSite(offer.site, 'offer:auto-closed', {
          id: offer.id,
          title: offer.title,
          deadline: offer.deadline
        });
      }

      logger.info(`[CronService] Successfully auto-closed ${expiredOffers.length} expired offer(s)`);
    } catch (err) {
      logger.error('[CronService] Auto-close expired offers job failed:', err);
    }
  });

  // ── Every 5 minutes — check for offers expiring soon (24h warning) ─────────
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Find offers expiring in the next 24 hours
      const expiringOffers = await prisma.jobOffer.findMany({
        where: {
          status: 'open',
          deadline: {
            gte: now,
            lte: in24Hours
          }
        },
        include: {
          _count: {
            select: { applications: true }
          }
        }
      });

      if (expiringOffers.length > 0) {
        logger.info(`[CronService] ${expiringOffers.length} offer(s) expiring within 24 hours`);
        
        // Notify HR about expiring offers
        for (const offer of expiringOffers) {
          SocketService.emitToSite(offer.site, 'offer:expiring-soon', {
            id: offer.id,
            title: offer.title,
            deadline: offer.deadline,
            applicationCount: offer._count.applications
          });
        }
      }
    } catch (err) {
      logger.error('[CronService] Expiring offers check failed:', err);
    }
  });

  logger.info('Cron jobs started: interview reminders, auto-close expired offers, expiring offers alerts');
}
