import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import {
    createAreaSchema,
    listAreaSchema,
    idParamSchema,
    updateAreaSchema
} from '../CrearArea/validator.js';
import * as Controller from '../CrearArea/Controller.js'

const router = Router();

// POST /api/areas
router.post('/', validate(createAreaSchema), Controller.create);

// GET /api/areas?active=true|false
router.get('/', validate(listAreaSchema), Controller.list);

// GET /api/areas/:id
router.get('/:id', validate(idParamSchema), Controller.detail);

// PATCH /api/areas/:id
router.patch('/:id', validate(updateAreaSchema), Controller.patch);

// DELETE (suave) /api/areas/:id  -> active=false
router.delete('/:id', validate(idParamSchema), Controller.remove);

// Health opcional
router.get('/health/ping', (_req, res) => {
    res.json({ ok: true, module: 'areas', ts: new Date().toISOString() });
});

export default router;
