// src/modules/Files/router.js
import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { createFileSchema, 
  listFilesSchema, 
  listAllFilesSchema} from './validator.js';
import * as Controller from './controller.js';

const router = Router();
 

// POST /api/files  → subir metadata del archivo
router.post('/', validate(createFileSchema), Controller.create);

// GET /api/files/by-ticket/:ticketId  → listar archivos de un ticket
router.get('/by-ticket/:ticketId', validate(listFilesSchema), Controller.listByTicket);

// GET /api/files/all  → listar todos los archivos
router.get('/all', validate(listAllFilesSchema), Controller.all);

// health
router.get('/health', (_req, res) => {
  res.json({ ok: true, module: 'files', ts: new Date().toISOString() });
});

export default router;
