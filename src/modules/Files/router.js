// src/modules/Files/router.js
import { Router } from 'express'
import { validate } from '../../middlewares/validate.js'
import {
  createFileSchema,
  listFilesSchema,
  listAllFilesSchema,
} from './validator.js'
import * as Controller from './controller.js'

const router = Router()

/* 
  ======================================================
    ⭐  Montado en /tikets/files
    ⇒ Los paths Swagger deben comenzar con /files/...
  ======================================================
*/

// Crear metadata de archivo
router.post(
  '/',
  /*
    #swagger.tags = ['Files']
    #swagger.description = 'Crear metadata de archivo'
    #swagger.path = '/files'
  */
  validate(createFileSchema),
  Controller.create
)

// Listar archivos por ticket
router.get(
  '/by-ticket/:ticketId',
  /*
    #swagger.tags = ['Files']
    #swagger.description = 'Listar archivos de un ticket'
    #swagger.path = '/files/by-ticket/{ticketId}'
  */
  validate(listFilesSchema),
  Controller.listByTicket
)

// Listar todos los archivos
router.get(
  '/all',
  /*
    #swagger.tags = ['Files']
    #swagger.description = 'Listar todos los archivos'
    #swagger.path = '/files/all'
  */
  validate(listAllFilesSchema),
  Controller.all
)

// Health check del módulo Files
router.get(
  '/health',
  /*
    #swagger.tags = ['Health']
    #swagger.description = 'Health check del módulo Files'
    #swagger.path = '/files/health'
  */
  (_req, res) => {
    res.json({ ok: true, module: 'files', ts: new Date().toISOString() })
  }
)

export default router
