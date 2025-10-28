import { z } from 'zod';
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'id inválido');

export const createAreaSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nombre demasiado corto'),
    description: z.string().min(1).optional()
  })
});

export const listAreaSchema = z.object({
  query: z.object({
    active: z.preprocess((v) => {
      if (v === 'true') return true;
      if (v === 'false') return false;
      return v;
    }, z.boolean().optional())
  }).optional()
});

export const idParamSchema = z.object({
  params: z.object({
    id: objectId
  })
});

export const updateAreaSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(1).optional(),
    active: z.boolean().optional()
  }).refine(obj => Object.keys(obj).length > 0, { message: 'Nada para actualizar' })
});

