import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../config/prisma';
import { NotificationRepository } from '../repositories/notification.repository';

const mockPrisma = vi.mocked(prisma);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NotificationRepository', () => {
  describe('create', () => {
    it('creates a notification with correct data', async () => {
      const data = { userId: 'user-1', type: 'info', payload: { title: 'Test', message: 'Hello' } };
      mockPrisma.notification.create.mockResolvedValue({ id: 'notif-1', ...data, readAt: null, emailSent: false, createdAt: new Date() } as any);

      const result = await NotificationRepository.create(data);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', type: 'info', payload: { title: 'Test', message: 'Hello' } },
      });
      expect(result.id).toBe('notif-1');
    });

    it('defaults type to info when not provided', async () => {
      const data = { userId: 'user-1', payload: { title: 'Test' } };
      mockPrisma.notification.create.mockResolvedValue({ id: 'notif-2', userId: 'user-1', type: 'info', payload: { title: 'Test' }, readAt: null, emailSent: false, createdAt: new Date() } as any);

      await NotificationRepository.create(data);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', type: 'info', payload: { title: 'Test' } },
      });
    });
  });

  describe('createManyForUsers', () => {
    it('creates notifications for multiple users', async () => {
      mockPrisma.notification.createMany.mockResolvedValue({ count: 2 });

      const result = await NotificationRepository.createManyForUsers({
        userIds: ['user-1', 'user-2'],
        type: 'info',
        payload: { title: 'Broadcast' },
      });

      expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 'user-1', type: 'info', payload: { title: 'Broadcast' } },
          { userId: 'user-2', type: 'info', payload: { title: 'Broadcast' } },
        ],
      });
      expect(result.count).toBe(2);
    });

    it('filters out null/empty userIds', async () => {
      const result = await NotificationRepository.createManyForUsers({
        userIds: ['user-1', '', null as any, undefined as any],
        type: 'info',
        payload: { title: 'Test' },
      });

      expect(mockPrisma.notification.createMany).toHaveBeenCalledWith({
        data: [{ userId: 'user-1', type: 'info', payload: { title: 'Test' } }],
      });
    });

    it('returns { count: 0 } for empty userIds', async () => {
      const result = await NotificationRepository.createManyForUsers({
        userIds: [],
        payload: { title: 'Test' },
      });
      expect(result).toEqual({ count: 0 });
    });
  });

  describe('findByUser', () => {
    it('fetches notifications for a user ordered by createdAt desc', async () => {
      const mockNotifs = [
        { id: 'n1', userId: 'user-1', createdAt: new Date('2025-01-02') },
        { id: 'n2', userId: 'user-1', createdAt: new Date('2025-01-01') },
      ];
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifs as any);

      const result = await NotificationRepository.findByUser('user-1', 10);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toEqual(mockNotifs);
    });

    it('defaults limit to 50', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);

      await NotificationRepository.findByUser('user-1');

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('countUnread', () => {
    it('returns count of unread notifications', async () => {
      mockPrisma.notification.count.mockResolvedValue(3);

      const result = await NotificationRepository.countUnread('user-1');

      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
      });
      expect(result).toBe(3);
    });
  });

  describe('markAllRead', () => {
    it('marks all unread notifications as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await NotificationRepository.markAllRead('user-1');

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
        data: { readAt: expect.any(Date) },
      });
      expect(result).toBe(5);
    });
  });

  describe('markOneRead', () => {
    it('marks a single notification as read', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

      const result = await NotificationRepository.markOneRead('notif-1', 'user-1');

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { readAt: expect.any(Date) },
      });
      expect(result).toBe(1);
    });
  });

  describe('deleteOne', () => {
    it('deletes a notification by id and userId', async () => {
      mockPrisma.notification.deleteMany.mockResolvedValue({ count: 1 });

      const result = await NotificationRepository.deleteOne('notif-1', 'user-1');

      expect(mockPrisma.notification.deleteMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
      });
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('deleteAllByUser', () => {
    it('deletes all notifications for a user', async () => {
      mockPrisma.notification.deleteMany.mockResolvedValue({ count: 10 });

      const result = await NotificationRepository.deleteAllByUser('user-1');

      expect(mockPrisma.notification.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual({ count: 10 });
    });
  });
});
