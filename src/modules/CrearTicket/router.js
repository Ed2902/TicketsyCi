import { Router } from 'express';
import { validate } from './validator.js';   
import { createTicketSchema } from './validator.js';
import * as Controller from './controller.js';

const router = Router();

// POST /api/tickets  → crear nuevo ticket
router.post('/tickets', validate(createTicketSchema), Controller.create);

// Health opcional del módulo
router.get('/tickets/health', (_req, res) => {
  res.json({ ok: true, module: 'CrearTicket', ts: new Date().toISOString() });
});

export default router;
