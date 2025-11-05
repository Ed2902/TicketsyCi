import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import {
  listByTicketSchema,
  listAllSchema,
  idParamSchema,
  createSchema,
  patchSchema,
  removeSchema
} from './validator.js';
import * as Controller from './Controller.js';

const router = Router();

// Listar mensajes de un ticket
router.get('/by-ticket/:ticketId', validate(listByTicketSchema), Controller.listByTicket);

// Listar TODOS (debug/admin)
router.get('/all', validate(listAllSchema), Controller.listAll);

// Detalle por ID
router.get('/:id', validate(idParamSchema), Controller.detail);

// Crear mensaje
router.post('/', validate(createSchema), Controller.create);

// Editar mensaje
router.patch('/:id', validate(patchSchema), Controller.patch);

// Eliminar mensaje
router.delete('/:id', validate(removeSchema), Controller.remove);

// Health opcional
router.get('/health/ping', (_req, res) =>
  res.json({ ok: true, module: 'Messages', ts: new Date().toISOString() })
);

export default router;
