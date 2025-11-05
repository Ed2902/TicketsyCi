// src/modules/Files/validator.js
import { z } from 'zod';
const orgIdEnum = z.enum(['Fastway', 'metalharvest', 'greenway']);
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'ticketId inválido');

export const createFileSchema = z.object({
  headers: z.object({
    'x-org-id': z.enum(['Fastway', 'metalharvest', 'greenway', 'impresistem']).optional(),
    'x-principal-id': z.string().optional()
  }).optional(),
  body: z.object({
    ticketId: objectId.optional(), 
    name: z.string().min(1),
    mimeType: z.string().optional(),
    size: z.number().int().nonnegative().optional(),
    storage: z
      .object({
        provider: z.string().optional(),
        path: z.string().optional()
      })
      .optional()
  })
});

export const listFilesSchema = z.object({
  headers: z.object({
    'x-org-id': z.enum(['Fastway', 'metalharvest', 'greenway', 'impresistem']).optional()
  }).optional(),
  params: z.object({
    ticketId: objectId
  })
});

export const listAllFilesSchema = z.object({
  headers: z.record(z.any()).optional(),
  params: z.object({}).optional(),
  query: z
    .object({ 
      orgId: orgIdEnum.optional(),
      limit: z.coerce.number().min(1).max(200).optional(),
      page: z.coerce.number().min(1).optional(),  
    })
    .optional(),
});