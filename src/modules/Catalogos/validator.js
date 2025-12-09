// src/modules/Catalogos/validator.js
import { z } from 'zod'

/**
 * Usamos el mismo estilo que en CrearArea:
 * export const algoSchema = { body, query, params }
 * para que el middleware validate() lo pueda usar.
 */

// 🔹 Común: parámetro ID
export const idParamSchema = {
  params: z.object({
    id: z.string().min(1, 'id es requerido'),
  }),
}

// ==================================================
//  📂 CATEGORÍAS
// ==================================================

export const listCategoriesSchema = {
  query: z.object({
    orgId: z.string().min(1).optional(), // si lo pasas por query
  }),
}

export const createCategorySchema = {
  body: z.object({
    orgId: z.string().min(1, 'orgId es requerido'),
    name: z.string().min(1, 'name es requerido'),
    description: z.string().optional(),
    color: z.string().optional(),
    active: z.boolean().optional(),
  }),
}

export const updateCategorySchema = {
  params: z.object({
    id: z.string().min(1, 'id es requerido'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    color: z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, 'color debe ser un hex válido')
  .optional(),
    active: z.boolean().optional(),
  }),
}

// ==================================================
//  🚥 PRIORIDADES
// ==================================================

export const listPrioritiesSchema = {
  query: z.object({
    orgId: z.string().min(1).optional(),
  }),
}

export const createPrioritySchema = {
  body: z.object({
    orgId: z.string().min(1, 'orgId es requerido'),
    name: z.string().min(1, 'name es requerido'),
    description: z.string().optional(),
    color: z.string().optional(),
    weight: z
      .number({
        required_error: 'weight es requerido',
        invalid_type_error: 'weight debe ser un número',
      })
      .int('weight debe ser un entero')
      .min(1, 'weight debe ser un número entero >= 1'),
    active: z.boolean().optional(),
  }),
}

export const updatePrioritySchema = {
  params: z.object({
    id: z.string().min(1, 'id es requerido'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    weight: z
      .number()
      .int('weight debe ser un entero')
      .min(1, 'weight debe ser un número entero >= 1')
      .optional(),
    active: z.boolean().optional(),
  }),
}

// ==================================================
//  📊 ESTADOS
// ==================================================

export const listStatusesSchema = {
  query: z.object({
    orgId: z.string().min(1).optional(),
  }),
}

export const createStatusSchema = {
  body: z.object({
    orgId: z.string().min(1, 'orgId es requerido'),
    name: z.string().min(1, 'name es requerido'),
    description: z.string().optional(),
    color: z.string().optional(),
    order: z
      .number({
        required_error: 'order es requerido',
        invalid_type_error: 'order debe ser un número',
      })
      .int('order debe ser un entero')
      .min(1, 'order debe ser un número entero >= 1'),
    isClosed: z.boolean().optional(),
    active: z.boolean().optional(),
  }),
}

export const updateStatusSchema = {
  params: z.object({
    id: z.string().min(1, 'id es requerido'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    order: z
      .number()
      .int('order debe ser un entero')
      .min(1, 'order debe ser un número entero >= 1')
      .optional(),
    isClosed: z.boolean().optional(),
    active: z.boolean().optional(),
  }),
}
