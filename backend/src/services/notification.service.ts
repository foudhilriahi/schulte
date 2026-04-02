import { appEmitter } from '../events/emitter';
import { NotificationRepository } from '../repositories/notification.repository';
import { SocketService } from './socket.service';
import {
  sendStatusChangeEmail,
  sendInterviewInviteEmail,
  sendInterviewReminderEmail,
} from './email.service';
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

        // Real-time socket push
        SocketService.emitToCandidate(candidateId, 'status:changed', {
          applicationId,
          status,
        });

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

        // Real-time socket push
        SocketService.emitToCandidate(candidateId, 'interview:scheduled', payload);

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

        // Persist to DB
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

        // Real-time socket push
        SocketService.emitToCandidate(candidateId, 'interview:reminder', payload);

        // Reminder email
        await sendInterviewReminderEmail(
          { email: candidateEmail, name: candidateName },
          { scheduledAt, location },
          { title: offerTitle },
        );
      } catch (err) {
        logger.error('[NotificationService] interview.reminder handler error:', err);
      }
    });

    logger.info('[NotificationService] All event listeners registered');
  }
}
