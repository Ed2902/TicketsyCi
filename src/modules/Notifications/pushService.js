import webpush from "web-push";
import PushSubscription from "./PushSubscription.js";

// ===============================
// Configuración VAPID
// ===============================
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const mailto = process.env.VAPID_MAILTO || "mailto:soporte@appfastway.com";

if (!publicKey || !privateKey) {
  console.warn("⚠️ VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY no configuradas en .env");
} else {
  webpush.setVapidDetails(mailto, publicKey, privateKey);
}

/**
 * Envía una notificación push a todas las suscripciones
 * asociadas a un principal (y opcionalmente a una org).
 */
export async function sendPushToPrincipal(principalId, payload, orgId) {
  try {
    const query = { principalId };
    if (orgId) query.orgId = orgId;

    const subs = await PushSubscription.find(query).lean();

    if (!subs.length) {
      console.log("ℹ️ No hay suscripciones para este principal:", principalId);
      return;
    }

    const data = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, data);
        } catch (err) {
          console.error("❌ Error enviando push:", err.statusCode, err.body);

          // Si la suscripción ya no es válida, la borramos
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log("🧹 Eliminando suscripción inválida:", sub.subscription?.endpoint);
            await PushSubscription.deleteOne({ _id: sub._id });
          }
        }
      })
    );
  } catch (err) {
    console.error("❌ Error general en sendPushToPrincipal:", err);
  }
}
