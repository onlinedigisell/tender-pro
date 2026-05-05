import webpush, { PushSubscription } from "web-push";
import { prisma } from "./prisma";

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(
    "mailto:onlinedigisell@example.com",
    publicKey,
    privateKey,
  );

  return true;
}

export async function sendPushNotification(payload: PushPayload) {
  if (!configureWebPush()) {
    return { sent: 0, removed: 0, skipped: true };
  }

  const subscriptions = await prisma.pushSubscription.findMany();
  let sent = 0;
  let removed = 0;

  for (const subscription of subscriptions) {
    const pushSubscription: PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      sent += 1;
    } catch (error) {
      const statusCode =
        typeof error === "object" && error && "statusCode" in error
          ? Number(error.statusCode)
          : 0;

      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.delete({
          where: { endpoint: subscription.endpoint },
        });
        removed += 1;
      }
    }
  }

  return { sent, removed, skipped: false };
}
