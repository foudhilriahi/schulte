import { appEmitter } from '../events/emitter';
import { NotificationRepository } from '../repositories/notification.repository';
import { SocketService } from './socket.service';
import {
  sendStatusChangeEmail,
  sendInterviewInviteEmail,
  sendInterviewReminderEmail,
  sendInterviewOutcomeEmail,
} from './email.service';
import { WebPushService } from './webpush.service';
import logger from '../utils/logger';

// ── French copy maps ─────────────────────────────────────────────────────────

const STATUS_TITLES: Record<string, string> = {
  reviewing: 'Candidature en cours d\'examen',
  interview: 'Entretien planifié',
  accepted:  'Candidature acceptée',
  rejected:  'Candidature non retenue',
};

const STATUS_MESSAGES: Record<string, (offerTitle: string) => string> = {
  reviewing: (t) => `Votre candidature pour le poste « ${t} » est en cours d'examen par notre équipe RH.`,
  interview: (t) => `Félicitations ! Vous êtes invité(e) à passer un entretien pour le poste « ${t} ».`,
  accepted:  (t) => `Bonne nouvelle ! Votre candidature pour le poste « ${t} » a été retenue.`,
  rejected:  (t) => `Nous vous informons que votre candidature pour le poste « ${t} » n'a pas été retenue.`,
};

const INTERVIEW_OUTCOME_COPY: Record<
  "pass" | "fail" | "no_show",
  { title: string; type: "info" | "success" | "warning" }
> = {
  pass: { title: "Entretien validé", type: "success" },
  fail: { title: "Résultat d'entretien", type: "warning" },
  no_show: { title: "Absence à l'entretien", type: "warning" },
};

// ── Service ──────────────────────────────────────────────────────────────────

export class NotificationService {
  /**
   * Registers all application-level event listeners.
   * Must be called once during server startup, after SocketService.init().
   */
  static init(): void {
    // ── application.statusChanged ────────────────────────────────────────────
    appEmitter.on('application.statusChanged', async (payload) => {
      try {
        const {
          applicationId,
          candidateId,
          status,
          candidateName,
          candidateEmail,
          offerTitle,
        } = payload;

        // 'new' is the initial state — no notification needed
        if (status === 'new') return;

        const title   = STATUS_TITLES[status]   ?? `Statut mis à jour : ${status}`;
        const message = STATUS_MESSAGES[status]
          ? STATUS_MESSAGES[status](offerTitle)
          : `Le statut de votre candidature pour « ${offerTitle} » a été mis à jour : ${status}.`;

        // Persist to DB
        await NotificationRepository.create({
          userId:  candidateId,
          type:    status === 'accepted' ? 'success' : status === 'rejected' ? 'warning' : 'info',
          payload: {
            title,
            message,
            applicationId,
            status,
            offerTitle,
          },
        });

        // Web Push Notification
        await WebPushService.sendToUser(candidateId, { title, body: message, url: '/notifications' });

        // Real-time socket push
        SocketService.emitToCandidate(candidateId, 'status:changed', {
          applicationId,
          status,
        });
        if (payload.offerSite) {
          SocketService.emitToSite(payload.offerSite, 'application:status_changed', {
            applicationId,
            candidateId,
            status,
            offerTitle,
          });
        }

        // Email
        await sendStatusChangeEmail(
          { email: candidateEmail, name: candidateName },
          { title: offerTitle },
          status,
        );
      } catch (err) {
        logger.error('[NotificationService] application.statusChanged handler error:', err);
      }
    });

    // ── interview.scheduled ──────────────────────────────────────────────────
    appEmitter.on('interview.scheduled', async (payload) => {
      try {
        const {
          interviewId,
          applicationId,
          candidateId,
          candidateName,
          candidateEmail,
          offerTitle,
          offerSite,
          scheduledAt,
          location,
          notes,
        } = payload;

        const dateStr = scheduledAt.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year:    'numeric',
          month:   'long',
          day:     'numeric',
        });

        const timeStr = scheduledAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const message =
          `Un entretien a été planifié pour le poste « ${offerTitle} » ` +
          `le ${dateStr} à ${timeStr}, ${location}.`;

        // Persist to DB
        await NotificationRepository.create({
          userId:  candidateId,
          type:    'info',
          payload: {
            title: 'Entretien planifié',
            message,
            interviewId,
            applicationId,
            offerTitle,
            scheduledAt: payload.scheduledAt,
            location,
          },
        });

        // Web Push
        await WebPushService.sendToUser(candidateId, { title: 'Entretien planifié', body: message, url: '/notifications' });

        // Real-time socket push
        SocketService.emitToCandidate(candidateId, 'interview:scheduled', payload);
        if (offerSite) {
          SocketService.emitToSite(offerSite, 'interview:scheduled', payload);
        }

        // Email with ICS attachment
        await sendInterviewInviteEmail(
          { email: candidateEmail, name: candidateName },
          { scheduledAt, location, notes },
          { title: offerTitle },
        );
      } catch (err) {
        logger.error('[NotificationService] interview.scheduled handler error:', err);
      }
    });

    // ── interview.reminder ───────────────────────────────────────────────────
    appEmitter.on('interview.reminder', async (payload) => {
      try {
        const {
          interviewId,
          candidateId,
          candidateName,
          candidateEmail,
          offerTitle,
          offerSite,
          scheduledAt,
          location,
        } = payload;

        const dateStr = scheduledAt.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year:    'numeric',
          month:   'long',
          day:     'numeric',
        });

        const timeStr = scheduledAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const message =
          `Rappel : votre entretien pour le poste « ${offerTitle} » ` +
          `est prévu demain, ${dateStr} à ${timeStr}, ${location}.`;

        // Persist to DB (candidate notification)
        await NotificationRepository.create({
          userId:  candidateId,
          type:    'info',
          payload: {
            title: 'Rappel : entretien demain',
            message,
            interviewId,
            offerTitle,
            scheduledAt,
            location,
          },
        });

        // Web Push
        await WebPushService.sendToUser(candidateId, { title: 'Rappel : entretien demain', body: message, url: '/notifications' });

        // Real-time socket push to candidate
        SocketService.emitToCandidate(candidateId, 'interview:reminder', payload);

        // Real-time socket push to HR site — so the HR dashboard can show a reminder badge
        if (offerSite) {
          SocketService.emitToSite(offerSite, 'interview:reminder', {
            interviewId,
            candidateName,
            offerTitle,
            scheduledAt,
            location,
          });
        }

        // Reminder email to candidate
        await sendInterviewReminderEmail(
          { email: candidateEmail, name: candidateName },
          { scheduledAt, location },
          { title: offerTitle },
        );
      } catch (err) {
        logger.error('[NotificationService] interview.reminder handler error:', err);
      }
    });

    // ── interview.outcomeChanged ────────────────────────────────────────────
    appEmitter.on('interview.outcomeChanged', async (payload) => {
      try {
        const {
          interviewId,
          applicationId,
          candidateId,
          offerTitle,
          offerSite,
          outcome,
          noShowCount,
          scheduledAt,
          location,
          candidateName,
          candidateEmail,
        } = payload;

        const dateStr = scheduledAt.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year:    'numeric',
          month:   'long',
          day:     'numeric',
        });

        const timeStr = scheduledAt.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const messageByOutcome: Record<'pass' | 'fail' | 'no_show', string> = {
          pass:
            `Votre entretien pour le poste « ${offerTitle} » est validé. ` +
            `Notre équipe poursuit les prochaines étapes.`,
          fail:
            `Votre entretien pour le poste « ${offerTitle} » n'a pas été retenu.`,
          no_show:
            `Votre entretien du ${dateStr} à ${timeStr} (${location}) a été marqué absent. ` +
            `Nombre d'absences enregistrées : ${noShowCount}.`,
        };

        const copy = INTERVIEW_OUTCOME_COPY[outcome];

        await NotificationRepository.create({
          userId:  candidateId,
          type:    copy.type,
          payload: {
            title: copy.title,
            message: messageByOutcome[outcome],
            interviewId,
            applicationId,
            offerTitle,
            outcome,
            noShowCount,
          },
        });

        // Web Push
        await WebPushService.sendToUser(candidateId, { title: copy.title, body: messageByOutcome[outcome], url: '/notifications' });

        SocketService.emitToCandidate(candidateId, 'interview:outcome_updated', payload);
        if (offerSite) {
          SocketService.emitToSite(offerSite, 'interview:outcome_updated', payload);
        }

        await sendInterviewOutcomeEmail(
          { email: candidateEmail, name: candidateName },
          { scheduledAt, location },
          { title: offerTitle },
          outcome,
          noShowCount,
        );
      } catch (err) {
        logger.error('[NotificationService] interview.outcomeChanged handler error:', err);
      }
    });

    logger.info('[NotificationService] All event listeners registered');
  }
}
