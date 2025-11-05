import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'id inválido');
const orgEnum = z.enum(['greenway', 'metalharvest', 'fastway']);

const reporterSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  email: z.string().email().optional()
});

const assigneeSchema = z.object({
  type: z.enum(['person', 'team']),
  id: z.string().min(1),
  name: z.string().optional()
});

export const listSchema = z.object({
  query: z
    .object({
      q: z.string().optional(),
      statusId: objectId.optional(),
      priorityId: objectId.optional(),
      categoryId: objectId.optional(),
      limit: z.coerce.number().min(1).max(200).optional(),
      page: z.coerce.number().min(1).optional()
    })
    .optional()
});

export const idParamSchema = z.object({
  params: z.object({ id: objectId })
});

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2),
    description: z.string().trim().min(2),
    categoryId: objectId,
    priorityId: objectId,
    statusId: objectId,
    reporter: reporterSchema,
    assignee: assigneeSchema,
    watchers: z.array(z.string()).optional(),
    attachmentsCount: z.number().int().min(0).optional(),
    tags: z.array(z.string()).optional(),
    custom: z.record(z.any()).optional(),
    dueAt: z.preprocess(
      v => (v ? new Date(v) : null),
      z.date().nullable().optional()
    )
  })
});

export const updateTicketSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      title: z.string().trim().min(2).optional(),
      description: z.string().trim().min(2).optional(),
      categoryId: objectId.optional(),
      priorityId: objectId.optional(),
      statusId: objectId.optional(),
      reporter: reporterSchema.optional(),
      assignee: assigneeSchema.optional(),
      watchers: z.array(z.string()).optional(),
      attachmentsCount: z.number().int().min(0).optional(),
      tags: z.array(z.string()).optional(),
      custom: z.record(z.any()).optional(),
      dueAt: z.preprocess(
        v => (v ? new Date(v) : null),
        z.date().nullable().optional()
      )
    })
    .refine(obj => Object.keys(obj).length > 0, {
      message: 'Nada para actualizar'
    })
});

/**
 * listado sin headers obligatorios
 */
export const listAllTicketsSchema = z.object({
  headers: z
    .object({
      'x-org-id': orgEnum.optional()
    })
   .passthrough()
  .catch({}),
  params: z.object({}).optional(),
  query: z
    .object({
      orgId: orgEnum.optional()
    })
    .optional()
});
