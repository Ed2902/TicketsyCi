import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'id inválido');
const orgEnum  = z.enum(['fastway', 'metalharvest', 'greenway']);

const senderSchema = z.object({
  principalId: z.string().min(1),
  name: z.string().optional(),
  email: z.string().email().optional()
});

const attachmentSchema = z.object({
  fileId: objectId.optional(), // si ya existe en Files
  name:   z.string().optional(),
  mime:   z.string().optional(),
  size:   z.number().int().nonnegative().optional()
});

// Listar mensajes por ticket
export const listByTicketSchema = z.object({
  headers: z.record(z.any()).optional(),
  params: z.object({
    ticketId: objectId
  }),
  query: z.object({
    limit: z.coerce.number().min(1).max(200).optional(),
    page: z.coerce.number().min(1).optional(),
    orgId: orgEnum.optional()
  }).optional()
});

// Listar TODOS (debug/admin)
export const listAllSchema = z.object({
  headers: z.record(z.any()).optional(),
  query: z.object({
    limit: z.coerce.number().min(1).max(200).optional(),
    page: z.coerce.number().min(1).optional(),
    orgId: orgEnum.optional()
  }).optional()
});

export const idParamSchema = z.object({
  headers: z.record(z.any()).optional(),
  params: z.object({ id: objectId })
});

// Crear mensaje
export const createSchema = z.object({
  headers: z.record(z.any()).optional(),
  body: z.object({
    orgId: orgEnum,               // explícito
    ticketId: objectId,           // ticket al que pertenece
    sender: senderSchema,         // quién habla
    message: z.string().min(1),   // texto
    attachments: z.array(attachmentSchema).optional()
  })
});

// Actualizar mensaje (solo texto/attachments)
export const patchSchema = z.object({
  headers: z.record(z.any()).optional(),
  params: z.object({ id: objectId }),
  body: z.object({
    message: z.string().min(1).optional(),
    attachments: z.array(attachmentSchema).optional()
  }).refine(o => Object.keys(o).length > 0, { message: 'Nada para actualizar' })
});

// Eliminar
export const removeSchema = idParamSchema;
