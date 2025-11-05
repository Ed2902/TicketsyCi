import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import {
  createTeamSchema,
  listTeamsSchema,
  idParamSchema,
  updateTeamSchema,
  listAllTeamsSchema
} from './validator.js';
import * as Controller from './controller.js';

const router = Router();
router.get('/all', validate(listAllTeamsSchema), Controller.all);

// POST /api/teams
router.post('/', validate(createTeamSchema), Controller.create);


// GET /api/teams
router.get('/', validate(listTeamsSchema), Controller.list);

// GET /api/teams/:id
router.get('/:id', validate(idParamSchema), Controller.detail);

// GET /api/teams/all

// PATCH /api/teams/:id
router.patch('/:id', validate(updateTeamSchema), Controller.patch);

// DELETE (lógico) /api/teams/:id
router.delete('/:id', validate(idParamSchema), Controller.remove);

// health
router.get('/health/ping', (_req, res) => {
  res.json({ ok: true, module: 'Teams', ts: new Date().toISOString() });
});

export default router;
