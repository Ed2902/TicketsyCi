import { Router } from 'express'
import { validate } from '../../middlewares/validate.js'
import {
  createTeamSchema,
  listTeamsSchema,
  idParamSchema,
  updateTeamSchema,
  listAllTeamsSchema,
} from './validator.js'
import * as Controller from './controller.js'

const router = Router()

// ======================================================
// ⭐ Montado en app como: /tikets/teams
//    → Entonces los paths swagger deben ser: /teams/...
// ======================================================

// Listar TODOS los equipos
router.get(
  '/all',
  /*
    #swagger.tags = ['Teams']
    #swagger.description = 'Lista todos los equipos'
    #swagger.path = '/teams/all'
  */
  validate(listAllTeamsSchema),
  Controller.all
)

// Crear equipo
router.post(
  '/',
  /*
    #swagger.tags = ['Teams']
    #swagger.description = 'Crea un nuevo equipo'
    #swagger.path = '/teams'
  */
  validate(createTeamSchema),
  Controller.create
)

// Listar equipos (paginado/filtrado)
router.get(
  '/',
  /*
    #swagger.tags = ['Teams']
    #swagger.description = 'Lista equipos (paginado/filtrado)'
    #swagger.path = '/teams'
  */
  validate(listTeamsSchema),
  Controller.list
)

// Detalle de un equipo por ID
router.get(
  '/:id',
  /*
    #swagger.tags = ['Teams']
    #swagger.description = 'Detalle de equipo por ID'
    #swagger.path = '/teams/{id}'
  */
  validate(idParamSchema),
  Controller.detail
)

// Editar equipo
router.patch(
  '/:id',
  /*
    #swagger.tags = ['Teams']
    #swagger.description = 'Actualizar un equipo por ID'
    #swagger.path = '/teams/{id}'
  */
  validate(updateTeamSchema),
  Controller.patch
)

// Eliminar equipo (lógico)
router.delete(
  '/:id',
  /*
    #swagger.tags = ['Teams']
    #swagger.description = 'Eliminar un equipo por ID'
    #swagger.path = '/teams/{id}'
  */
  validate(idParamSchema),
  Controller.remove
)

// Health check
router.get(
  '/health/ping',
  /*
    #swagger.tags = ['Health']
    #swagger.description = 'Health check del módulo Teams'
    #swagger.path = '/teams/health/ping'
  */
  (_req, res) => {
    res.json({ ok: true, module: 'Teams', ts: new Date().toISOString() })
  }
)

export default router
