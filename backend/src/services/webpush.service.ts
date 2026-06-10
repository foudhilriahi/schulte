import webpush from 'web-push';
import prisma from '../config/prisma';
import logger from '../utils/logger';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:foudhilriahi@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  logger.warn('Web push VAPID keys not configured.');
}

export class WebPushService {
  static async sendToUser(userId: string, payload: any) {
    if (!vapidPublicKey || !vapidPrivateKey) return;

    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      });

      for (const sub of subscriptions) {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        try {
          await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Subscription has expired or is no longer valid
            await prisma.pushSubscription.delete({ where: { id: sub.id } });
          } else {
            logger.error(`[WebPushService] error sending to ${sub.endpoint}:`, error);
          }
        }
      }
    } catch (err) {
      logger.error('[WebPushService] sendToUser error:', err);
    }
  }
}
