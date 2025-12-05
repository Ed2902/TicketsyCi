// src/modules/Notifications/controller.js
import * as Service from "./Service.js";
import { sendPushToPrincipal } from "../Notifications/pushService.js";
import PushSubscription from "./PushSubscription.js";

/**
 * Lista con filtros, usando query y/o headers
 */
export async function list(req, res, next) {
  try {
    const q = req.validated?.query ?? {};
    const orgId = q.orgId ?? req.headers["x-org-id"];
    const principalId = q.principalId ?? req.headers["x-principal-id"];

    const result = await Service.list({
      orgId,
      principalId,
      type: q.type,
      read: typeof q.read === "boolean" ? q.read : undefined,
      limit: q.limit,
      page: q.page,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function all(req, res, next) {
  try {
    const q = req.validated?.query ?? {};
    const result = await Service.listAll({
      orgId: q.orgId,
      principalId: q.principalId,
      type: q.type,
      read: typeof q.read === "boolean" ? q.read : undefined,
      limit: q.limit,
      page: q.page,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function detail(req, res, next) {
  try {
    const orgId = req.headers["x-org-id"] ?? undefined;
    const id = req.validated?.params?.id;
    const doc = await Service.detail({ orgId, id });
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: "Notificación no encontrada" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const b = req.validated.body;

    const doc = await Service.create({
      orgId: b.orgId,
      principalId: b.principalId,
      type: b.type,
      payload: b.payload,
      read: b.read,
    });

    // 👇 Intentamos enviar la push, pero si falla no rompemos la API
    try {
      const title =
        b.payload?.title || `Nueva notificación: ${b.type || "evento"}`;

      const body =
        b.payload?.message ||
        b.payload?.body ||
        JSON.stringify(b.payload ?? {});

      const url = b.payload?.url || "/";

      await sendPushToPrincipal(
        b.principalId,
        { title, body, url },
        b.orgId // también le pasamos orgId
      );
    } catch (errPush) {
      console.error(
        "⚠️ Error enviando push, pero la notificación se guardó:",
        errPush
      );
    }

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

export async function markRead(req, res, next) {
  try {
    const orgId = req.headers["x-org-id"] ?? undefined;
    const id = req.validated.params.id;
    const read = req.validated?.body?.read ?? true;
    const doc = await Service.markRead({ orgId, id, read });
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: "Notificación no encontrada" });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function markAll(req, res, next) {
  try {
    const body = req.validated?.body ?? {};
    const orgId = body.orgId ?? req.headers["x-org-id"];
    const principalId = body.principalId ?? req.headers["x-principal-id"];
    const read = typeof body.read === "boolean" ? body.read : true;

    const out = await Service.markAllRead({ orgId, principalId, read });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const orgId = req.headers["x-org-id"] ?? undefined;
    const id = req.validated.params.id;
    const ok = await Service.remove({ orgId, id });
    if (!ok)
      return res
        .status(404)
        .json({ error: true, message: "Notificación no encontrada" });
    res.json({ ok: true, id });
  } catch (e) {
    next(e);
  }
}

/**
 * Guarda o actualiza una suscripción de push
 */
export async function saveSubscription(req, res, next) {
  try {
    const b = req.validated.body;
    const orgId = b.orgId ?? req.headers["x-org-id"];
    const principalId = b.principalId ?? req.headers["x-principal-id"];
    const { subscription } = b;

    if (!principalId) {
      return res
        .status(400)
        .json({ ok: false, message: "principalId requerido" });
    }

    const doc = await PushSubscription.findOneAndUpdate(
      {
        principalId,
        orgId,
        "subscription.endpoint": subscription.endpoint,
      },
      {
        $set: { principalId, orgId, subscription },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ ok: true, subscription: doc });
  } catch (e) {
    next(e);
  }
}

/**
 * Elimina suscripciones (por principal y optionally endpoint)
 */
export async function removeSubscription(req, res, next) {
  try {
    const b = req.validated.body ?? {};
    const orgId = b.orgId ?? req.headers["x-org-id"];
    const principalId = b.principalId ?? req.headers["x-principal-id"];
    const { endpoint } = b;

    const q = {};
    if (orgId) q.orgId = orgId;
    if (principalId) q.principalId = principalId;
    if (endpoint) q["subscription.endpoint"] = endpoint;

    const r = await PushSubscription.deleteMany(q);
    res.json({ ok: true, deleted: r.deletedCount || 0 });
  } catch (e) {
    next(e);
  }
}
