import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    orgId: z.string().min(1).optional(),
    title: z.string().min(3, 'El título es muy corto'),
    description: z.string().min(1, 'La descripción es obligatoria'),
    assignee: z.object({
      type: z.enum(['person', 'team']),
      id: z.string().min(1),
      name: z.string().min(1).optional()
    }),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    category: z.string().min(1).optional(),
    watchers: z.array(z.string()).optional()
  })
});
