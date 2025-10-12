/* eslint-disable @typescript-eslint/no-explicit-any */
interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

export async function sendPushNotification(
  subscription: any,
  payload: PushPayload
) {
  // Check if VAPID keys are configured
  if (!process.env.VAPID_EMAIL || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('📱 Push service not configured (VAPID keys missing), skipping push notification');
    return null;
  }

  try {
    // Lazy load web-push to avoid build errors when not configured
    const webpush = (await import('web-push')).default;
    
    // Configure VAPID details
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    
    console.log('✅ Push notification sent successfully');
  } catch (error: any) {
    console.error('❌ Push notification error:', error);
    
    // Geçersiz subscription'ları temizle
    if (error.statusCode === 410) {
      console.log('⚠️ Subscription expired, should be removed from database');
    }
  }
}

