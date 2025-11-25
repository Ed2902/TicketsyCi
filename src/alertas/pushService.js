import webpush from "web-push";
import PushSubscription from "../alertas/PushSubscription.js";

export async function sendPushToUser(userId, payload) {
  try {
    const subs = await PushSubscription.find({ userId });

    if (subs.length === 0) return;

    const data = JSON.stringify(payload);

    for (const sub of subs) {
      await webpush.sendNotification(sub.subscription, data).catch(err => {
        console.error("❌ Error enviando push:", err);
      });
    }
  } catch (err) {
    console.error("❌ Error general en push:", err);
  }
}
