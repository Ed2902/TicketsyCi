import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import {
  listSchema,
  listAllSchema,
  idParamSchema,
  createSchema,
  markReadSchema,
  markAllSchema,
  removeSchema
} from './validator.js';
import * as Controller from './controller.js';

const router = Router();

// Listar (con filtros; puede tomar org/principal de headers o query)
router.get('/',        validate(listSchema),     Controller.list);

// Listar TODO (sin exigir headers) – útil para debug/seed
router.get('/all',     validate(listAllSchema),  Controller.all);

// Detalle por ID
router.get('/:id',     validate(idParamSchema),  Controller.detail);

// Crear (normalmente lo haría el backend cuando suceden eventos)
router.post('/',       validate(createSchema),   Controller.create);

// Marcar leída/no leída una notificación
router.patch('/:id/read', validate(markReadSchema), Controller.markRead);

// Marcar todas (de un principal/org) como leídas/no leídas
router.patch('/read-all', validate(markAllSchema), Controller.markAll);

// Borrar notificación
router.delete('/:id',  validate(removeSchema),   Controller.remove);

// Health opcional
router.get('/health/ping', (_req, res) =>
  res.json({ ok: true, module: 'Notifications', ts: new Date().toISOString() })
);

export default router;
