import { describe, it, expect, vi, beforeEach } from 'vitest';
import webpush from 'web-push';
import prisma from '../config/prisma';
import { WebPushService } from '../services/webpush.service';
import logger from '../utils/logger';

const mockPrisma = vi.mocked(prisma);
const mockWebpush = vi.mocked(webpush);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('WebPushService', () => {
  describe('sendToUser', () => {
    const userId = 'user-1';
    const payload = { title: 'Test Notification', body: 'Hello!', url: '/test' };

    it('sends push notification to all user subscriptions', async () => {
      const subscriptions = [
        { id: 'sub-1', endpoint: 'https://endpoint1.com', p256dh: 'key1', auth: 'auth1' },
        { id: 'sub-2', endpoint: 'https://endpoint2.com', p256dh: 'key2', auth: 'auth2' },
      ];
      mockPrisma.pushSubscription.findMany.mockResolvedValue(subscriptions as any);
      mockWebpush.sendNotification.mockResolvedValue({} as any);

      await WebPushService.sendToUser(userId, payload);

      expect(mockPrisma.pushSubscription.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockWebpush.sendNotification).toHaveBeenCalledTimes(2);
      expect(mockWebpush.sendNotification).toHaveBeenCalledWith(
        { endpoint: 'https://endpoint1.com', keys: { p256dh: 'key1', auth: 'auth1' } },
        JSON.stringify(payload),
      );
    });

    it('does nothing when user has no subscriptions', async () => {
      mockPrisma.pushSubscription.findMany.mockResolvedValue([]);

      await WebPushService.sendToUser(userId, payload);

      expect(mockPrisma.pushSubscription.findMany).toHaveBeenCalled();
      expect(mockWebpush.sendNotification).not.toHaveBeenCalled();
    });

    it('removes expired subscriptions (410 Gone)', async () => {
      const sub = { id: 'sub-expired', endpoint: 'https://expired.com', p256dh: 'key', auth: 'auth' };
      mockPrisma.pushSubscription.findMany.mockResolvedValue([sub] as any);
      const error = new Error('Gone');
      (error as any).statusCode = 410;
      mockWebpush.sendNotification.mockRejectedValue(error);

      await WebPushService.sendToUser(userId, payload);

      expect(mockPrisma.pushSubscription.delete).toHaveBeenCalledWith({
        where: { id: 'sub-expired' },
      });
    });

    it('removes invalid subscriptions (404 Not Found)', async () => {
      const sub = { id: 'sub-invalid', endpoint: 'https://invalid.com', p256dh: 'key', auth: 'auth' };
      mockPrisma.pushSubscription.findMany.mockResolvedValue([sub] as any);
      const error = new Error('Not Found');
      (error as any).statusCode = 404;
      mockWebpush.sendNotification.mockRejectedValue(error);

      await WebPushService.sendToUser(userId, payload);

      expect(mockPrisma.pushSubscription.delete).toHaveBeenCalledWith({
        where: { id: 'sub-invalid' },
      });
    });

    it('logs error for non-expired failures', async () => {
      const sub = { id: 'sub-ok', endpoint: 'https://ok.com', p256dh: 'key', auth: 'auth' };
      mockPrisma.pushSubscription.findMany.mockResolvedValue([sub] as any);
      const error = new Error('Network failure');
      (error as any).statusCode = 500;
      mockWebpush.sendNotification.mockRejectedValue(error);

      await WebPushService.sendToUser(userId, payload);

      expect(logger.error).toHaveBeenCalled();
      expect(mockPrisma.pushSubscription.delete).not.toHaveBeenCalled();
    });

    it('handles prisma query errors gracefully', async () => {
      mockPrisma.pushSubscription.findMany.mockRejectedValue(new Error('DB error'));

      await WebPushService.sendToUser(userId, payload);

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
