// src/modules/CrearArea/router.js
import { Router } from 'express'
import { validate } from '../../middlewares/validate.js'
import {
  createAreaSchema,
  listAreaSchema,
  idParamSchema,
  updateAreaSchema,
  listAllAreasSchema,
} from './validator.js'
import * as Controller from './Controller.js'

const router = Router()

/* 
  ======================================================
    ⭐ Montado en /tikets/areas
    ⇒ Los paths Swagger deben ser /areas/...
  ======================================================
*/

// Crear área
router.post(
  '/',
  /*
    #swagger.tags = ['Areas']
    #swagger.description = 'Crear una nueva área'
    #swagger.path = '/areas'
  */
  validate(createAreaSchema),
  Controller.create
)

// Listar TODAS las áreas
router.get(
  '/all',
  /*
    #swagger.tags = ['Areas']
    #swagger.description = 'Lista todas las áreas'
    #swagger.path = '/areas/all'
  */
  validate(listAllAreasSchema),
  Controller.all
)

// Listar áreas (paginado/filtrado)
router.get(
  '/',
  /*
    #swagger.tags = ['Areas']
    #swagger.description = 'Lista áreas (paginado/filtrado)'
    #swagger.path = '/areas'
  */
  validate(listAreaSchema),
  Controller.list
)

// Detalle de área por ID
router.get(
  '/:id',
  /*
    #swagger.tags = ['Areas']
    #swagger.description = 'Detalle de un área por ID'
    #swagger.path = '/areas/{id}'
  */
  validate(idParamSchema),
  Controller.detail
)

// Actualizar área
router.patch(
  '/:id',
  /*
    #swagger.tags = ['Areas']
    #swagger.description = 'Actualizar área por ID'
    #swagger.path = '/areas/{id}'
  */
  validate(updateAreaSchema),
  Controller.patch
)

// Eliminar área
router.delete(
  '/:id',
  /*
    #swagger.tags = ['Areas']
    #swagger.description = 'Eliminar área por ID'
    #swagger.path = '/areas/{id}'
  */
  validate(idParamSchema),
  Controller.remove
)

// Health check
router.get(
  '/health/ping',
  /*
    #swagger.tags = ['Health']
    #swagger.description = 'Health check del módulo Areas'
    #swagger.path = '/areas/health/ping'
  */
  (_req, res) =>
    res.json({ ok: true, module: 'areas', ts: new Date().toISOString() })
)

export default router
