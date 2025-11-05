// src/modules/CrearArea/validator.js
import { z } from 'zod';
import { ORG_ENUM } from '../CrearTicket/model.js';
const orgEnum = z.enum(['greenway', 'metalharvest', 'fastway']);
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'id inválido');

export const createAreaSchema = z.object({
  headers: z.object({
    'x-org-id': z.enum(ORG_ENUM).optional(),
    'x-principal-id': z.string().optional()
  }).passthrough(),
  body: z.object({
    orgId: z.enum(ORG_ENUM).optional(), // por si no viene en el header
    name: z.string().min(2, 'Nombre demasiado corto'),
    description: z.string().optional()
  })
});

export const listAreaSchema = z.object({
  headers: z.object({
    'x-org-id': z.enum(ORG_ENUM).optional()
  }).passthrough(),
  query: z.object({
    active: z.preprocess(v => {
      if (v === 'true') return true;
      if (v === 'false') return false;
      return v;
    }, z.boolean().optional())
  }).optional()
});

export const idParamSchema = z.object({
  headers: z.object({
    'x-org-id': z.enum(ORG_ENUM).optional()
  }).passthrough(),
    params: z.object({
      id: objectId
    })
});

export const updateAreaSchema = z.object({
  headers: z.object({
    'x-org-id': z.enum(ORG_ENUM).optional(),
    'x-principal-id': z.string().optional()
  }).passthrough(),
  params: z.object({
    id: objectId
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    active: z.boolean().optional()
  }).refine(obj => Object.keys(obj).length > 0, {
    message: 'Nada para actualizar'
  })
  
});

export const listAllAreasSchema = z.object({
  headers: z
    .object({
      'x-org-id': orgEnum.optional(),
    })
    .partial()
    .optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      orgId: orgEnum.optional(),
    })
    .optional(),
});
