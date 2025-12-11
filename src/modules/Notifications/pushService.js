import webpush from "web-push";
import PushSubscription from "./PushSubscription.js";

// ===============================
// Configuración VAPID
// ===============================
const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const mailto = process.env.VAPID_MAILTO || "mailto:soporte@appfastway.com";

if (!publicKey || !privateKey) {
  console.warn("⚠️ VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY no definidas en .env");
} else {
  webpush.setVapidDetails(mailto, publicKey, privateKey);
}

/**
 * Envía una notificación push a todas las suscripciones
 * asociadas a un principal (y opcionalmente filtrado por orgId).
 *
 * @param {string} principalId
 * @param {object} payload - { title, body, url, ... }
 * @param {string} [orgId]
 */
export async function sendPushToPrincipal(principalId, payload, orgId) {
  try {
    // 🔎 Base query por principal / org
    const baseQuery = { principalId };
    if (orgId) baseQuery.orgId = orgId;

    // 🔎 Usar solo suscripciones activas,
    // pero soportar documentos viejos sin "active"
    const query = {
      ...baseQuery,
      $or: [{ active: true }, { active: { $exists: false } }],
    };

    const subs = await PushSubscription.find(query).lean();

    if (!subs.length) {
      console.log("ℹ️ No hay suscripciones activas para este principal:", {
        principalId,
        orgId,
      });
      return;
    }

    const data = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, data);
          console.log(
            "✅ Push enviada a endpoint:",
            sub.subscription?.endpoint
          );
        } catch (err) {
          const statusCode = err?.statusCode;
          console.error("❌ Error enviando push:", {
            statusCode,
            body: err?.body?.toString?.() || err?.body,
          });

          // 👇 En lugar de borrar, solo marcamos esta suscripción como inactiva
          if (statusCode === 404 || statusCode === 410) {
            console.log(
              "🧹 Marcando suscripción inválida como inactiva:",
              sub.subscription?.endpoint
            );
            await PushSubscription.updateOne(
              { _id: sub._id },
              {
                $set: {
                  active: false,
                  lastErrorAt: new Date(),
                },
              }
            );
          }
        }
      })
    );
  } catch (err) {
    console.error("❌ Error general en sendPushToPrincipal:", err);
  }
}
