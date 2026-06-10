import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { NotificationRepository } from '../repositories/notification.repository';
import prisma from '../config/prisma';

const mockPrisma = vi.mocked(prisma);
const mockRepo = vi.mocked(NotificationRepository);

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: { userId: 'user-1', role: 'candidate', site: null },
    query: {},
    params: {},
    body: {},
    ...overrides,
  } as any;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NotificationsController', () => {
  describe('getMyNotifications', () => {
    it('returns user notifications with default limit', async () => {
      const req = mockReq();
      const res = mockRes();
      const mockNotifs = [{ id: 'n1', userId: 'user-1', payload: {}, type: 'info', readAt: null, createdAt: new Date() }];
      vi.spyOn(NotificationRepository, 'findByUser').mockResolvedValue(mockNotifs as any);

      await NotificationsController.getMyNotifications(req, res);

      expect(NotificationRepository.findByUser).toHaveBeenCalledWith('user-1', 50);
      expect(res.json).toHaveBeenCalledWith(mockNotifs);
    });

    it('respects custom limit within bounds', async () => {
      const req = mockReq({ query: { limit: '10' } } as any);
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'findByUser').mockResolvedValue([]);

      await NotificationsController.getMyNotifications(req, res);

      expect(NotificationRepository.findByUser).toHaveBeenCalledWith('user-1', 10);
    });

    it('clamps limit to max 100', async () => {
      const req = mockReq({ query: { limit: '999' } } as any);
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'findByUser').mockResolvedValue([]);

      await NotificationsController.getMyNotifications(req, res);

      expect(NotificationRepository.findByUser).toHaveBeenCalledWith('user-1', 100);
    });

    it('returns 500 on error', async () => {
      const req = mockReq();
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'findByUser').mockRejectedValue(new Error('DB error'));

      await NotificationsController.getMyNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUnreadCount', () => {
    it('returns unread count', async () => {
      const req = mockReq();
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'countUnread').mockResolvedValue(3);

      await NotificationsController.getUnreadCount(req, res);

      expect(res.json).toHaveBeenCalledWith({ count: 3 });
    });
  });

  describe('subscribe', () => {
    it('upserts a push subscription', async () => {
      const req = mockReq({
        body: {
          subscription: {
            endpoint: 'https://endpoint.test',
            keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
          },
        },
      });
      const res = mockRes();
      mockPrisma.pushSubscription.upsert.mockResolvedValue({} as any);

      await NotificationsController.subscribe(req, res);

      expect(mockPrisma.pushSubscription.upsert).toHaveBeenCalledWith({
        where: { endpoint: 'https://endpoint.test' },
        update: { userId: 'user-1', p256dh: 'p256dh-key', auth: 'auth-key' },
        create: { userId: 'user-1', endpoint: 'https://endpoint.test', p256dh: 'p256dh-key', auth: 'auth-key' },
      });
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('rejects invalid subscription', async () => {
      const req = mockReq({ body: { subscription: { endpoint: 'https://test.com', keys: null } } });
      const res = mockRes();

      await NotificationsController.subscribe(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects missing subscription', async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();

      await NotificationsController.subscribe(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getVapidPublicKey', () => {
    it('returns the VAPID public key', () => {
      const req = mockReq();
      const res = mockRes();

      NotificationsController.getVapidPublicKey(req, res);

      expect(res.json).toHaveBeenCalledWith({ publicKey: 'test-public-key' });
    });
  });

  describe('markAllRead', () => {
    it('marks all notifications as read', async () => {
      const req = mockReq();
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'markAllRead').mockResolvedValue(5);

      await NotificationsController.markAllRead(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, count: 5 });
    });
  });

  describe('markOneRead', () => {
    it('marks a single notification as read', async () => {
      const req = mockReq({ params: { id: 'notif-1' } } as any);
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'markOneRead').mockResolvedValue(1);

      await NotificationsController.markOneRead(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 404 if notification not found', async () => {
      const req = mockReq({ params: { id: 'notif-unknown' } } as any);
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'markOneRead').mockResolvedValue(0);

      await NotificationsController.markOneRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteOne', () => {
    it('deletes a notification', async () => {
      const req = mockReq({ params: { id: 'notif-1' } } as any);
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'deleteOne').mockResolvedValue({ count: 1 });

      await NotificationsController.deleteOne(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('returns 404 if notification not found', async () => {
      const req = mockReq({ params: { id: 'notif-unknown' } } as any);
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'deleteOne').mockResolvedValue({ count: 0 });

      await NotificationsController.deleteOne(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('clearAll', () => {
    it('deletes all notifications for the user', async () => {
      const req = mockReq();
      const res = mockRes();
      vi.spyOn(NotificationRepository, 'deleteAllByUser').mockResolvedValue({ count: 10 });

      await NotificationsController.clearAll(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, count: 10 });
    });
  });
});
