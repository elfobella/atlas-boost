/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './prisma';
import { sendEmail } from './email-service';
import { sendPushNotification } from './push-service';
import Pusher from 'pusher';

// Pusher Configuration
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true,
});

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  channels?: ('in_app' | 'email' | 'push')[];
  actionUrl?: string;
  data?: Record<string, unknown>;
  expiresAt?: Date;
}

export class NotificationService {
  /**
   * Ana bildirim gönderme fonksiyonu
   */
  async sendNotification(notificationData: NotificationData) {
    const {
      userId,
      type,
      title,
      message,
      priority = 'NORMAL',
      channels = ['in_app'],
      actionUrl,
      data,
      expiresAt,
    } = notificationData;

    console.log('📬 NotificationService: Sending notification', {
      userId,
      type,
      title,
      priority,
      requestedChannels: channels,
    });

    try {
      // 1. Kullanıcı tercihlerini kontrol et
      const preferences = await this.getUserPreferences(userId);
      console.log('✓ User preferences loaded:', {
        inAppEnabled: preferences.inAppEnabled,
        emailEnabled: preferences.emailEnabled,
        pushEnabled: preferences.pushEnabled,
      });
      
      // 2. Sessiz saatleri kontrol et
      if (await this.isQuietHours(preferences, priority)) {
        // Düşük öncelikli bildirimleri atla
        if (priority === 'LOW' || priority === 'NORMAL') {
          return null;
        }
      }

      // 3. Hangi kanalların aktif olduğunu belirle
      const activeChannels = this.getActiveChannels(channels, preferences);
      console.log('✓ Active channels determined:', activeChannels);

      // 4. Bildirim veritabanına kaydet (in-app için)
      let notification = null;
      if (activeChannels.includes('in_app')) {
        console.log('💾 Saving notification to database...');
        notification = await prisma.notification.create({
          data: {
            userId,
            type: type as 'ORDER_CREATED' | 'ORDER_PAYMENT_CONFIRMED' | 'ORDER_BOOSTER_ASSIGNED' | 'ORDER_STARTED' | 'ORDER_PROGRESS_UPDATE' | 'ORDER_COMPLETED' | 'ORDER_CANCELLED' | 'BOOST_JOB_ASSIGNED' | 'BOOST_JOB_REMINDER' | 'BOOST_JOB_DEADLINE' | 'BOOST_PAYMENT_PROCESSED' | 'MESSAGE_RECEIVED' | 'CHAT_SUPPORT_REPLY' | 'SYSTEM_MAINTENANCE' | 'SYSTEM_UPDATE' | 'ACCOUNT_UPDATE' | 'SECURITY_ALERT',
            title,
            message,
            priority: priority as any,
            channels: JSON.stringify(activeChannels),
            actionUrl,
            data: JSON.stringify(data || {}),
            expiresAt,
          },
        });

        // Real-time broadcast (Pusher)
        await this.broadcastNotification(userId, notification);
      }

      // 5. Email gönder
      if (activeChannels.includes('email') && preferences.emailEnabled) {
        await this.sendEmailNotification(userId, {
          type,
          title,
          message,
          actionUrl,
          data,
        });
      }

      // 6. Push notification gönder
      if (activeChannels.includes('push') && preferences.pushEnabled) {
        await this.sendPushNotifications(userId, preferences, {
          title,
          message,
          actionUrl,
          data,
        });
      }

      return notification;
    } catch (error) {
      console.error('Send notification error:', error);
      return null;
    }
  }

  /**
   * Kullanıcı tercihlerini getir
   */
  private async getUserPreferences(userId: string) {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Eğer tercih yoksa varsayılan oluştur
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Sessiz saatleri kontrol et
   */
  private async isQuietHours(preferences: any, priority: string): Promise<boolean> {
    if (!preferences.quietHoursEnabled || priority === 'HIGH' || priority === 'URGENT') {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    if (start && end) {
      // Sessiz saatler aralığında mı kontrol et
      if (start < end) {
        return currentTime >= start && currentTime <= end;
      } else {
        // Gece yarısını geçen aralıklar için
        return currentTime >= start || currentTime <= end;
      }
    }

    return false;
  }

  /**
   * Aktif kanalları belirle
   */
  private getActiveChannels(
    requestedChannels: string[],
    preferences: any
  ): string[] {
    const active: string[] = [];

    if (requestedChannels.includes('in_app') && preferences.inAppEnabled) {
      active.push('in_app');
    }
    if (requestedChannels.includes('email') && preferences.emailEnabled) {
      active.push('email');
    }
    if (requestedChannels.includes('push') && preferences.pushEnabled) {
      active.push('push');
    }

    return active;
  }

  /**
   * Real-time bildirim yayını (Pusher)
   */
  private async broadcastNotification(userId: string, notification: any) {
    try {
      const channel = `user-${userId}`;
      const eventData = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        actionUrl: notification.actionUrl,
        data: notification.data,
        createdAt: notification.createdAt,
      };
      
      console.log('📡 Broadcasting to Pusher:', {
        channel,
        event: 'notification',
        hasData: !!eventData,
      });
      
      await pusher.trigger(channel, 'notification', eventData);
      console.log('✅ Pusher broadcast successful');
    } catch (error) {
      console.error('❌ Pusher broadcast error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  }

  /**
   * Email bildirimi gönder
   */
  private async sendEmailNotification(
    userId: string,
    notification: any
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user) return;

      await sendEmail({
        to: user.email,
        subject: notification.title,
        html: this.getEmailTemplate(notification, user.name || 'Kullanıcı'),
      });
    } catch (error) {
      console.error('Email notification error:', error);
    }
  }

  /**
   * Push notification gönder
   */
  private async sendPushNotifications(
    userId: string,
    preferences: any,
    notification: any
  ) {
    try {
      const tokens = JSON.parse(preferences.pushTokens || '[]');
      
      for (const tokenData of tokens) {
        await sendPushNotification(tokenData.token, {
          title: notification.title,
          body: notification.message,
          icon: '/images/logo.png',
          badge: '/images/badge.png',
          data: {
            url: notification.actionUrl,
            ...notification.data,
          },
        });
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }

  /**
   * Email template oluştur
   */
  private getEmailTemplate(notification: any, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 AtlastBoost</h1>
            </div>
            <div class="content">
              <h2>${notification.title}</h2>
              <p>Merhaba ${userName},</p>
              <p>${notification.message}</p>
              ${notification.actionUrl ? `<a href="${process.env.NEXT_PUBLIC_APP_URL}${notification.actionUrl}" class="button">Görüntüle</a>` : ''}
            </div>
            <div class="footer">
              <p>AtlastBoost - Profesyonel Oyun Boost Hizmeti</p>
              <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Sipariş bildirimleri için helper fonksiyonlar
   */
  async notifyOrderCreated(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    await this.sendNotification({
      userId,
      type: 'ORDER_CREATED',
      title: 'Siparişiniz Oluşturuldu',
      message: `${order.game.toUpperCase()} ${order.currentRank} → ${order.targetRank} boost siparişiniz başarıyla oluşturuldu.`,
      priority: 'NORMAL',
      channels: ['in_app', 'email'],
      actionUrl: `/dashboard/orders/${orderId}`,
      data: {
        orderId,
        game: order.game,
        currentRank: order.currentRank,
        targetRank: order.targetRank,
        price: order.price.toString(),
      },
    });
  }

  async notifyPaymentConfirmed(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    await this.sendNotification({
      userId,
      type: 'ORDER_PAYMENT_CONFIRMED',
      title: 'Ödeme Onaylandı',
      message: `${order.price} TL tutarındaki ödemeniz başarıyla alındı. En kısa sürede bir booster atanacak.`,
      priority: 'HIGH',
      channels: ['in_app', 'email', 'push'],
      actionUrl: `/dashboard/orders/${orderId}`,
      data: {
        orderId,
        amount: order.price.toString(),
      },
    });
  }

  async notifyBoosterAssigned(orderId: string, userId: string, boosterId: string) {
    console.log('🎯 notifyBoosterAssigned called:', { orderId, userId, boosterId });
    
    const [order, booster] = await Promise.all([
      prisma.order.findUnique({ where: { id: orderId } }),
      prisma.user.findUnique({ where: { id: boosterId } }),
    ]);

    if (!order || !booster) {
      console.error('❌ Order or booster not found:', { order: !!order, booster: !!booster });
      return;
    }

    console.log('✓ Order and booster found, sending notifications...');

    // Müşteriye bildir
    console.log('📧 Sending notification to customer:', userId);
    await this.sendNotification({
      userId,
      type: 'ORDER_BOOSTER_ASSIGNED',
      title: 'Booster Atandı',
      message: `${booster.name || 'Booster'} siparişinize atandı. Boost işleminiz yakında başlayacak.`,
      priority: 'HIGH',
      channels: ['in_app', 'email', 'push'],
      actionUrl: `/dashboard/orders/${orderId}`,
      data: {
        orderId,
        boosterName: booster.name,
      },
    });

    // Booster'a bildir
    console.log('📧 Sending notification to booster:', boosterId);
    await this.sendNotification({
      userId: boosterId,
      type: 'BOOST_JOB_ASSIGNED',
      title: 'Yeni İş Atandı',
      message: `Size yeni bir ${order.game.toUpperCase()} boost işi atandı: ${order.currentRank} → ${order.targetRank}`,
      priority: 'URGENT',
      channels: ['in_app', 'email', 'push'],
      actionUrl: `/dashboard/booster`,
      data: {
        orderId,
        game: order.game,
        currentRank: order.currentRank,
        targetRank: order.targetRank,
      },
    });
    console.log('✅ Booster notifications completed');
  }

  async notifyOrderStarted(orderId: string, userId: string, boosterId: string) {
    const [order, booster] = await Promise.all([
      prisma.order.findUnique({ where: { id: orderId } }),
      prisma.user.findUnique({ where: { id: boosterId } }),
    ]);

    if (!order || !booster) return;

    await this.sendNotification({
      userId,
      type: 'ORDER_STARTED',
      title: 'Boost Başladı',
      message: `${booster.name || 'Booster'} boost işinizi başlattı. İlerlemeyi takip edebilirsiniz.`,
      priority: 'HIGH',
      channels: ['in_app', 'push'],
      actionUrl: `/dashboard/orders/${orderId}`,
      data: {
        orderId,
        boosterName: booster.name,
      },
    });
  }

  async notifyOrderCompleted(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    await this.sendNotification({
      userId,
      type: 'ORDER_COMPLETED',
      title: 'Boost Tamamlandı',
      message: `Tebrikler! ${order.targetRank} hedef rank'ınıza ulaşıldı. Booster'ı değerlendirin.`,
      priority: 'HIGH',
      channels: ['in_app', 'email', 'push'],
      actionUrl: `/dashboard/orders/${orderId}`,
      data: {
        orderId,
        finalRank: order.targetRank,
      },
    });
  }

  async notifyOrderCancelled(orderId: string, userId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    await this.sendNotification({
      userId,
      type: 'ORDER_CANCELLED',
      title: 'Sipariş İptal Edildi',
      message: reason || 'Siparişiniz iptal edildi. İade işlemi 3-5 iş günü içinde tamamlanacak.',
      priority: 'HIGH',
      channels: ['in_app', 'email'],
      actionUrl: `/dashboard/orders/${orderId}`,
      data: {
        orderId,
        reason,
      },
    });
  }
}

// Singleton instance
export const notificationService = new NotificationService();

