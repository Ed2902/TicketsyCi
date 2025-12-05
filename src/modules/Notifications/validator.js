// src/modules/Notifications/validator.js
import { z } from "zod";

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "id inválido");
const orgEnum = z.enum(["fastway", "metalharvest", "greenway"]);

// Utilidad para boolean en query (?read=true/false)
const zBoolLoose = z.preprocess((v) => {
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}, z.boolean().optional());

export const listSchema = z.object({
  headers: z.record(z.any()).optional(), // headers opcionales
  query: z
    .object({
      orgId: orgEnum.optional(),
      principalId: z.string().optional(),
      type: z.string().optional(),
      read: zBoolLoose,
      limit: z.coerce.number().min(1).max(200).optional(),
      page: z.coerce.number().min(1).optional(),
    })
    .optional(),
  params: z.object({}).optional(),
});

export const listAllSchema = z.object({
  headers: z.record(z.any()).optional(),
  query: z
    .object({
      orgId: orgEnum.optional(),
      principalId: z.string().optional(),
      type: z.string().optional(),
      read: zBoolLoose,
      limit: z.coerce.number().min(1).max(200).optional(),
      page: z.coerce.number().min(1).optional(),
    })
    .optional(),
  params: z.object({}).optional(),
});

export const idParamSchema = z.object({
  headers: z.record(z.any()).optional(),
  params: z.object({ id: objectId }),
});

export const createSchema = z.object({
  headers: z.record(z.any()).optional(),
  body: z.object({
    orgId: orgEnum, // para crear explícitamente
    principalId: z.string().min(1),
    type: z.string().min(1),
    payload: z.record(z.any()).optional(),
    read: z.boolean().optional(),
  }),
});

export const markReadSchema = z.object({
  headers: z.record(z.any()).optional(),
  params: z.object({ id: objectId }),
  body: z.object({ read: z.boolean().optional() }).optional(),
});

export const markAllSchema = z.object({
  headers: z.record(z.any()).optional(),
  body: z
    .object({
      orgId: orgEnum.optional(),
      principalId: z.string().optional(),
      read: z.boolean().optional(),
    })
    .optional(),
});

export const removeSchema = idParamSchema;

// ============================
// Suscripciones WebPush
// ============================
export const saveSubscriptionSchema = z.object({
  headers: z.record(z.any()).optional(),
  body: z.object({
    orgId: orgEnum.optional(),
    principalId: z.string().optional(), // puede venir de header
    subscription: z
      .object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      })
      .passthrough(),
  }),
});

export const removeSubscriptionSchema = z.object({
  headers: z.record(z.any()).optional(),
  body: z.object({
    orgId: orgEnum.optional(),
    principalId: z.string().optional(),
    endpoint: z.string().url().optional(),
  }),
});
