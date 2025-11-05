// src/modules/CrearArea/router.js
import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import {
  createAreaSchema,
  listAreaSchema,
  idParamSchema,
  updateAreaSchema,
  listAllAreasSchema
} from './validator.js';
import * as Controller from './Controller.js';

const router = Router();

// POST /api/areas 🎃
router.post('/', validate(createAreaSchema), Controller.create);

router.get('/all', validate(listAllAreasSchema), Controller.all);

// GET /api/areas  🥹
router.get('/',  validate (listAreaSchema), Controller.list);


// GET /api/areas/:id <- este es para hacer el get por ID
router.get('/:id', validate(idParamSchema), Controller.detail);

// PATCH /api/areas/:id (actualizar)
router.patch('/:id', validate(updateAreaSchema), Controller.patch);

// DELETE /api/areas/:id  (borrado lógico)
router.delete('/:id', validate(idParamSchema), Controller.remove);

// health
router.get('/health/ping', (_req, res) => {
  res.json({ ok: true, module: 'areas', ts: new Date().toISOString() });
});

export default router;
