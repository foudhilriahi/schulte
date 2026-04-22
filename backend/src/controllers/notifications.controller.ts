import { Request, Response } from "express";
import { NotificationRepository } from "../repositories/notification.repository";
import logger from "../utils/logger";

export class NotificationsController {
  // GET /api/notifications
  static async getMyNotifications(req: Request, res: Response): Promise<void> {
    try {
      const rawLimit = Number(req.query.limit);
      const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(rawLimit, 1), 100)
        : 50;

      const notifications = await NotificationRepository.findByUser(
        req.user!.userId,
        limit,
      );
      res.json(notifications);
    } catch (err: any) {
      logger.error("Get notifications error:", err);
      res.status(500).json({ error: "Echec de la recuperation des notifications" });
    }
  }

  // GET /api/notifications/unread-count
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await NotificationRepository.countUnread(req.user!.userId);
      res.json({ count });
    } catch (err: any) {
      logger.error("Get unread count error:", err);
      res.status(500).json({ error: "Echec de la recuperation du nombre de non lus" });
    }
  }

  // PATCH /api/notifications/mark-all-read
  static async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      const count = await NotificationRepository.markAllRead(req.user!.userId);
      res.json({ success: true, count });
    } catch (err: any) {
      logger.error("Mark all read error:", err);
      res.status(500).json({ error: "Echec du marquage des notifications comme lues" });
    }
  }

  // PATCH /api/notifications/:id/read
  static async markOneRead(req: Request, res: Response): Promise<void> {
    try {
      const updatedCount = await NotificationRepository.markOneRead(
        req.params.id as string,
        req.user!.userId,
      );
      if (!updatedCount) {
        res.status(404).json({ error: 'Notification introuvable' });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      logger.error("Mark one read error:", err);
      res.status(500).json({ error: "Echec du marquage de la notification comme lue" });
    }
  }

  // DELETE /api/notifications/:id
  static async deleteOne(req: Request, res: Response): Promise<void> {
    try {
      const result = await NotificationRepository.deleteOne(
        req.params.id as string,
        req.user!.userId,
      );
      if (!result.count) {
        res.status(404).json({ error: 'Notification introuvable' });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      logger.error("Delete notification error:", err);
      res.status(500).json({ error: "Echec de la suppression de la notification" });
    }
  }

  // DELETE /api/notifications/clear-all
  static async clearAll(req: Request, res: Response): Promise<void> {
    try {
      const result = await NotificationRepository.deleteAllByUser(req.user!.userId);
      res.json({ success: true, count: result.count });
    } catch (err: any) {
      logger.error('Clear notifications error:', err);
      res.status(500).json({ error: 'Echec de la suppression des notifications' });
    }
  }
}
