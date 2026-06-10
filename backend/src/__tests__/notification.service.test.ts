import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { appEmitter } from '../events/emitter';
import { NotificationService } from '../services/notification.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { WebPushService } from '../services/webpush.service';
import * as emailService from '../services/email.service';
import { SocketService } from '../services/socket.service';
import type { ApplicationStatusChangedPayload, InterviewScheduledPayload, InterviewReminderPayload, InterviewOutcomeChangedPayload } from '../events/emitter';

vi.mock('../services/email.service', () => ({
  sendStatusChangeEmail: vi.fn(),
  sendInterviewInviteEmail: vi.fn(),
  sendInterviewReminderEmail: vi.fn(),
  sendInterviewOutcomeEmail: vi.fn(),
}));

vi.mock('../services/webpush.service', () => ({
  WebPushService: {
    sendToUser: vi.fn(),
  },
}));

vi.mock('../services/socket.service', () => ({
  SocketService: {
    emitToCandidate: vi.fn(),
    emitToSite: vi.fn(),
  },
}));

vi.mock('../repositories/notification.repository', () => ({
  NotificationRepository: {
    create: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  NotificationService.init();
});

afterEach(() => {
  appEmitter.removeAllListeners();
});

describe('NotificationService', () => {
  describe('application.statusChanged', () => {
    const payload: ApplicationStatusChangedPayload = {
      applicationId: 'app-1',
      candidateId: 'cand-1',
      status: 'interview',
      candidateName: 'John Doe',
      candidateEmail: 'john@test.com',
      offerTitle: 'Poste Test',
      offerSite: 'Bouarada',
    };

    it('persists notification to DB', async () => {
      appEmitter.emit('application.statusChanged', payload);

      await vi.waitFor(() => {
        expect(NotificationRepository.create).toHaveBeenCalledWith({
          userId: 'cand-1',
          type: 'info',
          payload: expect.objectContaining({
            title: 'Entretien planifié',
            applicationId: 'app-1',
            status: 'interview',
            offerTitle: 'Poste Test',
          }),
        });
      });
    });

    it('sends web push notification', async () => {
      appEmitter.emit('application.statusChanged', payload);

      await vi.waitFor(() => {
        expect(WebPushService.sendToUser).toHaveBeenCalledWith('cand-1', {
          title: 'Entretien planifié',
          body: expect.stringContaining('Poste Test'),
          url: '/notifications',
        });
      });
    });

    it('emits socket events to candidate and site', async () => {
      appEmitter.emit('application.statusChanged', payload);

      await vi.waitFor(() => {
        expect(SocketService.emitToCandidate).toHaveBeenCalledWith('cand-1', 'status:changed', {
          applicationId: 'app-1',
          status: 'interview',
        });
        expect(SocketService.emitToSite).toHaveBeenCalledWith('Bouarada', 'application:status_changed', {
          applicationId: 'app-1',
          candidateId: 'cand-1',
          status: 'interview',
          offerTitle: 'Poste Test',
        });
      });
    });

    it('sends status change email', async () => {
      appEmitter.emit('application.statusChanged', payload);

      await vi.waitFor(() => {
        expect(emailService.sendStatusChangeEmail).toHaveBeenCalledWith(
          { email: 'john@test.com', name: 'John Doe' },
          { title: 'Poste Test' },
          'interview',
        );
      });
    });

    it('skips notification for "new" status', async () => {
      appEmitter.emit('application.statusChanged', { ...payload, status: 'new' });

      await new Promise((r) => setTimeout(r, 50));
      expect(NotificationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('interview.scheduled', () => {
    const payload: InterviewScheduledPayload = {
      interviewId: 'int-1',
      applicationId: 'app-1',
      candidateId: 'cand-1',
      candidateName: 'John Doe',
      candidateEmail: 'john@test.com',
      offerTitle: 'Poste Test',
      offerSite: 'Bouarada',
      scheduledAt: new Date('2025-06-15T10:00:00Z'),
      location: 'Bouarada Office',
      notes: 'Venez avec votre CV',
    };

    it('persists interview notification to DB', async () => {
      appEmitter.emit('interview.scheduled', payload);

      await vi.waitFor(() => {
        expect(NotificationRepository.create).toHaveBeenCalledWith({
          userId: 'cand-1',
          type: 'info',
          payload: expect.objectContaining({
            title: 'Entretien planifié',
            interviewId: 'int-1',
            applicationId: 'app-1',
          }),
        });
      });
    });

    it('sends web push for interview scheduled', async () => {
      appEmitter.emit('interview.scheduled', payload);

      await vi.waitFor(() => {
        expect(WebPushService.sendToUser).toHaveBeenCalledWith('cand-1', {
          title: 'Entretien planifié',
          body: expect.stringContaining('Poste Test'),
          url: '/notifications',
        });
      });
    });
  });

  describe('interview.reminder', () => {
    const payload: InterviewReminderPayload = {
      interviewId: 'int-1',
      candidateId: 'cand-1',
      candidateName: 'John Doe',
      candidateEmail: 'john@test.com',
      offerTitle: 'Poste Test',
      offerSite: 'Bouarada',
      scheduledAt: new Date('2025-06-16T10:00:00Z'),
      location: 'Zaghouan Office',
    };

    it('persists reminder notification', async () => {
      appEmitter.emit('interview.reminder', payload);

      await vi.waitFor(() => {
        expect(NotificationRepository.create).toHaveBeenCalledWith({
          userId: 'cand-1',
          type: 'info',
          payload: expect.objectContaining({
            title: expect.stringContaining('Rappel'),
          }),
        });
      });
    });
  });

  describe('interview.outcomeChanged', () => {
    const payload: InterviewOutcomeChangedPayload = {
      interviewId: 'int-1',
      applicationId: 'app-1',
      candidateId: 'cand-1',
      candidateName: 'John Doe',
      candidateEmail: 'john@test.com',
      offerTitle: 'Poste Test',
      offerSite: 'Bouarada',
      outcome: 'pass',
      previousOutcome: null,
      noShowCount: 0,
      scheduledAt: new Date('2025-06-15T10:00:00Z'),
      location: 'Bouarada Office',
    };

    it('persists outcome notification with success type for pass', async () => {
      appEmitter.emit('interview.outcomeChanged', payload);

      await vi.waitFor(() => {
        expect(NotificationRepository.create).toHaveBeenCalledWith({
          userId: 'cand-1',
          type: 'success',
          payload: expect.objectContaining({
            title: 'Entretien validé',
          }),
        });
      });
    });

    it('persists outcome notification with warning type for no_show', async () => {
      appEmitter.emit('interview.outcomeChanged', { ...payload, outcome: 'no_show', noShowCount: 2 });

      await vi.waitFor(() => {
        expect(NotificationRepository.create).toHaveBeenCalledWith({
          userId: 'cand-1',
          type: 'warning',
          payload: expect.objectContaining({
            title: 'Absence à l\'entretien',
          }),
        });
      });
    });
  });
});
