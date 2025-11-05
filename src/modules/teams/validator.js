import { z } from 'zod';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'id inválido');
const orgEnum = z.enum(['fastway', 'metalharvest', 'greenway']);

const memberSchema = z.object({
  principalId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

// POST /api/teams
export const createTeamSchema = z.object({
  headers: z
    .object({
      'x-org-id': orgEnum.optional(),
      'x-principal-id': z.string().optional(),
    })
    .optional(),
  body: z.object({
    orgId: orgEnum.optional(),
    name: z.string().min(2, 'Nombre demasiado corto'),
    description: z.string().optional(),
    members: z.array(memberSchema).optional(),
  }),
});

// GET /api/teams
export const listTeamsSchema = z.object({
  headers: z
    .object({
      'x-org-id': orgEnum.optional(),
    })
    .optional(),
  query: z
    .object({
      active: z
        .preprocess((v) => {
          if (v === 'true') return true;
          if (v === 'false') return false;
          return v;
        }, z.boolean().optional())
        .optional(),
    })
    .optional(),
});

// GET /api/teams/:id
export const idParamSchema = z.object({
  headers: z
    .object({
      'x-org-id': orgEnum.optional(),
    })
    .optional(),
  params: z.object({
    id: objectId,
  }),
});

// PATCH /api/teams/:id
export const updateTeamSchema = z.object({
  headers: z
    .object({
      'x-org-id': orgEnum.optional(),
    })
    .optional(),
  params: z.object({
    id: objectId,
  }),
  body: z
    .object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      members: z.array(memberSchema).optional(),
      active: z.boolean().optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'Nada para actualizar',
    }),
});

// GET /api/teams/all
export const listAllTeamsSchema = z.object({
  headers: z.record(z.any()).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      orgId: orgEnum.optional(),
    })
    .optional(),
});
