import { Router } from 'express'
import { validate } from '../../middlewares/validate.js'
import {
  listByTicketSchema,
  listAllSchema,
  idParamSchema,
  createSchema,
  patchSchema,
  removeSchema,
} from './validator.js'
import * as Controller from './Controller.js'
import { createCheckSchema } from 'express-validator/lib/middlewares/schema.js'
import { contextsKey } from 'express-validator/lib/base.js'
import { compile } from 'morgan'
import { diskStorage } from 'multer'

const router = Router()

// ======================================================
//  ⭐ IMPORTANTE: Todas estas rutas están montadas en:
//      /tikets/messages
//  ⇒ Entonces el path real que Swagger debe mostrar es:
//      /messages/... (basePath = /tikets lo completa)
// ======================================================

// Listar mensajes de un ticket
router.get(
  '/by-ticket/:ticketId',
  /* 
    #swagger.tags = ['Messages']
    #swagger.description = 'Lista mensajes por ID de ticket'
    #swagger.path = '/messages/by-ticket/{ticketId}'
  */
  validate(listByTicketSchema),
  Controller.listByTicket
)

// Listar TODOS los mensajes
router.get(
  '/all',
  /* 
    #swagger.tags = ['Messages']
    #swagger.description = 'Lista todos los mensajes'
    #swagger.path = '/messages/all'
  */
  validate(listAllSchema),
  Controller.listAll
)

// Detalle por ID
router.get(
  '/:id',
  /* 
    #swagger.tags = ['Messages']
    #swagger.description = 'Detalle de mensaje por ID'
    #swagger.path = '/messages/{id}'
  */
  validate(idParamSchema),
  Controller.detail
)

// Crear mensaje
router.post(
  '/',
  /* 
    #swagger.tags = ['Messages']
    #swagger.description = 'Crea un nuevo mensaje'
    #swagger.path = '/messages'
  */
  validate(createSchema),
  Controller.create
)

// Editar mensaje
router.patch(
  '/:id',
  /* 
    #swagger.tags = ['Messages']
    #swagger.description = 'Editar un mensaje existente'
    #swagger.path = '/messages/{id}'
  */
  validate(patchSchema),
  Controller.patch
)

// Eliminar mensaje
router.delete(
  '/:id',
  /* 
    #swagger.tags = ['Messages']
    #swagger.description = 'Eliminar un mensaje'
    #swagger.path = '/messages/{id}'
  */
  validate(removeSchema),
  Controller.remove
)

// Health check del módulo
router.get(
  '/health/ping',
  /* 
    #swagger.tags = ['Health']
    #swagger.description = 'Health check del módulo Messages'
    #swagger.path = '/messages/health/ping'
  */
  (_req, res) =>
    res.json({ ok: true, module: 'Messages', ts: new Date().toISOString() })
)

export default router

