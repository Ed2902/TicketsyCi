// src/modules/Notifications/pushService.js
import webpush from "web-push";
import PushSubscription from "./PushSubscription.js";

// Enviamos a TODAS las suscripciones asociadas a un principal
export async function sendPushToPrincipal(principalId, payload) {
  try {
    const subs = await PushSubscription.find({ principalId });

    if (!subs.length) {
      console.log("ℹ️ No hay suscripciones para este principal:", principalId);
      return;
    }

    const data = JSON.stringify(payload);

    await Promise.all(
      subs.map((sub) =>
        webpush.sendNotification(sub.subscription, data).catch((err) => {
          console.error("❌ Error enviando push:", err);
        })
      )
    );
  } catch (err) {
    console.error("❌ Error general en sendPushToPrincipal:", err);
  }
}
