import { Router } from 'express'
import { validate } from '../../middlewares/validate.js'
import {
  // Categorías
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,

  // Prioridades
  listPrioritiesSchema,
  createPrioritySchema,
  updatePrioritySchema,

  // Estados
  listStatusesSchema,
  createStatusSchema,
  updateStatusSchema,

  // Común
  idParamSchema,
} from './validator.js'
import * as Controller from '../Catalogos/controller.js'

const router = Router()

/* 
  ======================================================
    ⭐ Montado en /tikets/catalog
    ⇒ Los paths Swagger deben ser /catalog/...
  ======================================================
*/

/* ============================
   📂 CATEGORÍAS
   ============================ */

// Crear categoría
router.post(
  '/categories',
  /*
    #swagger.tags = ['Catálogos - Categorías']
    #swagger.description = 'Crear una nueva categoría de ticket'
    #swagger.path = '/catalog/categories'
  */
  validate(createCategorySchema),
  Controller.createCategory
)

// Listar categorías (paginado/filtrado si aplica)
router.get(
  '/categories',
  /*
    #swagger.tags = ['Catálogos - Categorías']
    #swagger.description = 'Lista categorías (paginado/filtrado)'
    #swagger.path = '/catalog/categories'
  */
  validate(listCategoriesSchema),
  Controller.listCategories
)

// Detalle de categoría por ID
router.get(
  '/categories/:id',
  /*
    #swagger.tags = ['Catálogos - Categorías']
    #swagger.description = 'Detalle de una categoría por ID'
    #swagger.path = '/catalog/categories/{id}'
  */
  validate(idParamSchema),
  Controller.detailCategory
)

// Actualizar categoría
router.patch(
  '/categories/:id',
  /*
    #swagger.tags = ['Catálogos - Categorías']
    #swagger.description = 'Actualizar una categoría por ID'
    #swagger.path = '/catalog/categories/{id}'
  */
  validate(updateCategorySchema),
  Controller.updateCategory
)

// Eliminar categoría
router.delete(
  '/categories/:id',
  /*
    #swagger.tags = ['Catálogos - Categorías']
    #swagger.description = 'Eliminar una categoría por ID'
    #swagger.path = '/catalog/categories/{id}'
  */
  validate(idParamSchema),
  Controller.removeCategory
)

/* ============================
   🚥 PRIORIDADES
   ============================ */

// Crear prioridad
router.post(
  '/priorities',
  /*
    #swagger.tags = ['Catálogos - Prioridades']
    #swagger.description = 'Crear una nueva prioridad de ticket'
    #swagger.path = '/catalog/priorities'
  */
  validate(createPrioritySchema),
  Controller.createPriority
)

// Listar prioridades
router.get(
  '/priorities',
  /*
    #swagger.tags = ['Catálogos - Prioridades']
    #swagger.description = 'Lista prioridades (paginado/filtrado)'
    #swagger.path = '/catalog/priorities'
  */
  validate(listPrioritiesSchema),
  Controller.listPriorities
)

// Detalle de prioridad por ID
router.get(
  '/priorities/:id',
  /*
    #swagger.tags = ['Catálogos - Prioridades']
    #swagger.description = 'Detalle de una prioridad por ID'
    #swagger.path = '/catalog/priorities/{id}'
  */
  validate(idParamSchema),
  Controller.detailPriority
)

// Actualizar prioridad
router.patch(
  '/priorities/:id',
  /*
    #swagger.tags = ['Catálogos - Prioridades']
    #swagger.description = 'Actualizar una prioridad por ID'
    #swagger.path = '/catalog/priorities/{id}'
  */
  validate(updatePrioritySchema),
  Controller.updatePriority
)

// Eliminar prioridad
router.delete(
  '/priorities/:id',
  /*
    #swagger.tags = ['Catálogos - Prioridades']
    #swagger.description = 'Eliminar una prioridad por ID'
    #swagger.path = '/catalog/priorities/{id}'
  */
  validate(idParamSchema),
  Controller.removePriority
)

/* ============================
   📊 ESTADOS
   ============================ */

// Crear estado
router.post(
  '/statuses',
  /*
    #swagger.tags = ['Catálogos - Estados']
    #swagger.description = 'Crear un nuevo estado de ticket'
    #swagger.path = '/catalog/statuses'
  */
  validate(createStatusSchema),
  Controller.createStatus
)

// Listar estados
router.get(
  '/statuses',
  /*
    #swagger.tags = ['Catálogos - Estados']
    #swagger.description = 'Lista estados (paginado/filtrado)'
    #swagger.path = '/catalog/statuses'
  */
  validate(listStatusesSchema),
  Controller.listStatuses
)

// Detalle de estado por ID
router.get(
  '/statuses/:id',
  /*
    #swagger.tags = ['Catálogos - Estados']
    #swagger.description = 'Detalle de un estado por ID'
    #swagger.path = '/catalog/statuses/{id}'
  */
  validate(idParamSchema),
  Controller.detailStatus
)

// Actualizar estado
router.patch(
  '/statuses/:id',
  /*
    #swagger.tags = ['Catálogos - Estados']
    #swagger.description = 'Actualizar un estado por ID'
    #swagger.path = '/catalog/statuses/{id}'
  */
  validate(updateStatusSchema),
  Controller.updateStatus
)

// Eliminar estado
router.delete(
  '/statuses/:id',
  /*
    #swagger.tags = ['Catálogos - Estados']
    #swagger.description = 'Eliminar un estado por ID'
    #swagger.path = '/catalog/statuses/{id}'
  */
  validate(idParamSchema),
  Controller.removeStatus
)

/* ============================
   ❤️ Health check
   ============================ */

router.get(
  '/health/ping',
  /*
    #swagger.tags = ['Health']
    #swagger.description = 'Health check del módulo Catálogos'
    #swagger.path = '/catalog/health/ping'
  */
  (_req, res) =>
    res.json({ ok: true, module: 'catalogos', ts: new Date().toISOString() })
)

export default router
