import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import {
  listSchema,
  idParamSchema,
  createTicketSchema,
  updateTicketSchema,
  listAllTicketsSchema
} from './validator.js';
import * as Controller from './controller.js';

const router = Router();

router.get('/', validate(listSchema), Controller.list);
router.get('/all', validate(listAllTicketsSchema), Controller.all);
router.get('/:id', validate(idParamSchema), Controller.detail);
router.post('/', validate(createTicketSchema), Controller.create);
router.patch('/:id', validate(updateTicketSchema), Controller.update);
router.delete('/:id', validate(idParamSchema), Controller.remove);

router.get('/health/ping', (_req, res) => {
  res.json({ ok: true, module: 'CrearTicket', ts: new Date().toISOString() });
});

export default router;
