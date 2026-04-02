import { Request, Response } from "express";
import { NotificationRepository } from "../repositories/notification.repository";
import logger from "../utils/logger";

export class NotificationsController {
  // GET /api/notifications
  static async getMyNotifications(req: Request, res: Response): Promise<void> {
    try {
      const notifications = await NotificationRepository.findByUser(
        req.user!.userId,
      );
      res.json(notifications);
    } catch (err: any) {
      logger.error("Get notifications error:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }

  // GET /api/notifications/unread-count
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await NotificationRepository.countUnread(req.user!.userId);
      res.json({ count });
    } catch (err: any) {
      logger.error("Get unread count error:", err);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  }

  // PATCH /api/notifications/mark-all-read
  static async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      const count = await NotificationRepository.markAllRead(req.user!.userId);
      res.json({ success: true, count });
    } catch (err: any) {
      logger.error("Mark all read error:", err);
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  }

  // PATCH /api/notifications/:id/read
  static async markOneRead(req: Request, res: Response): Promise<void> {
    try {
      const notification = await NotificationRepository.markOneRead(
        req.params.id as string,
      );
      res.json(notification);
    } catch (err: any) {
      logger.error("Mark one read error:", err);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  }

  // DELETE /api/notifications/:id
  static async deleteOne(req: Request, res: Response): Promise<void> {
    try {
      await NotificationRepository.deleteOne(req.params.id as string);
      res.json({ success: true });
    } catch (err: any) {
      logger.error("Delete notification error:", err);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  }
}
