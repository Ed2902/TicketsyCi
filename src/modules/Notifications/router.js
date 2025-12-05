// src/modules/Notifications/router.js
import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import {
  listSchema,
  listAllSchema,
  idParamSchema,
  createSchema,
  markReadSchema,
  markAllSchema,
  removeSchema,
  saveSubscriptionSchema,
  removeSubscriptionSchema,
} from "./validator.js";
import * as Controller from "./controller.js";

const router = Router();

// ======================================================
//   ⭐  Montado en /tikets/notifications
//   ⇒ Los paths Swagger deben ser /notifications/...
// ======================================================

// Listar con filtros
router.get(
  "/",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Lista notificaciones con filtros'
    #swagger.path = '/notifications'
  */
  validate(listSchema),
  Controller.list
);

// Listar todas (debug)
router.get(
  "/all",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Lista todas las notificaciones'
    #swagger.path = '/notifications/all'
  */
  validate(listAllSchema),
  Controller.all
);

// Detalle por ID
router.get(
  "/:id",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Detalle de notificación por ID'
    #swagger.path = '/notifications/{id}'
  */
  validate(idParamSchema),
  Controller.detail
);

// Crear notificación
router.post(
  "/",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Crear una notificación'
    #swagger.path = '/notifications'
  */
  validate(createSchema),
  Controller.create
);

// Marcar una como leída/no leída
router.patch(
  "/:id/read",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Marca una notificación como leída/no leída'
    #swagger.path = '/notifications/{id}/read'
  */
  validate(markReadSchema),
  Controller.markRead
);

// Marcar todas como leídas/no leídas
router.patch(
  "/read-all",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Marca todas las notificaciones como leídas/no leídas'
    #swagger.path = '/notifications/read-all'
  */
  validate(markAllSchema),
  Controller.markAll
);

// Eliminar notificación
router.delete(
  "/:id",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Eliminar una notificación por ID'
    #swagger.path = '/notifications/{id}'
  */
  validate(removeSchema),
  Controller.remove
);

// ==============================
// Rutas WebPush: suscripciones
// ==============================

// Guardar/actualizar suscripción
router.post(
  "/subscriptions",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Registrar o actualizar una suscripción WebPush'
    #swagger.path = '/notifications/subscriptions'
  */
  validate(saveSubscriptionSchema),
  Controller.saveSubscription
);

// Eliminar suscripciones
router.delete(
  "/subscriptions",
  /*
    #swagger.tags = ['Notifications']
    #swagger.description = 'Eliminar suscripciones WebPush'
    #swagger.path = '/notifications/subscriptions'
  */
  validate(removeSubscriptionSchema),
  Controller.removeSubscription
);

// Health check
router.get(
  "/health/ping",
  /*
    #swagger.tags = ['Health']
    #swagger.description = 'Health check del módulo Notifications'
    #swagger.path = '/notifications/health/ping'
  */
  (_req, res) =>
    res.json({
      ok: true,
      module: "Notifications",
      ts: new Date().toISOString(),
    })
);

export default router;
