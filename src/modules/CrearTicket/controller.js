import * as Service from './services.js'
import { ORG_ENUM } from './model.js'
import * as NotificationsService from "../Notifications/Service.js";
import { sendPushToPrincipal } from "../Notifications/pushService.js";

// helper: normaliza y valida orgId
function resolveOrgId(req) {
  const raw = (
    req.header('x-org-id') ||
    req.query?.orgId ||
    req.body?.orgId ||
    ''
  )
    .toString()
    .trim()
    .toLowerCase()

  if (!raw) return { error: 'Falta x-org-id u orgId' }

  if (!ORG_ENUM.includes(raw)) {
    return { error: `orgId inválido. Use uno de: ${ORG_ENUM.join(', ')}` }
  }

  return { value: raw }
}

// helper: obtiene principal (reporter.id)
function resolvePrincipal(req, body) {
  const principal = req.header('x-principal-id') || body?.reporter?.id || ''
  if (!principal) return { error: 'Falta x-principal-id o body.reporter.id' }
  return { value: principal }
}

/* ============================================================
   META: categorías, prioridades, estados, usuarios
   Endpoints:
   - GET /tikets/tickets/categories
   - GET /tikets/tickets/priorities
   - GET /tikets/tickets/statuses
   - GET /tikets/tickets/users
   ============================================================ */

export async function listCategories(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error })
    }

    const data = await Service.listCategories({ orgId: org.value })
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listPriorities(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error })
    }

    const data = await Service.listPriorities({ orgId: org.value })
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listStatuses(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error })
    }

    const data = await Service.listStatuses({ orgId: org.value })
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listUsers(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error })
    }

    const data = await Service.listUsers({ orgId: org.value })
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

/* ============================================================
   LISTAR / DETALLE / CRUD DE TICKETS
   ============================================================ */

export async function list(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const { q, statusId, priorityId, categoryId, limit, page } = req.query || {}
    const result = await Service.list({
      orgId: org.value,
      q,
      statusId,
      priorityId,
      categoryId,
      limit,
      page,
    })
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export async function detail(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const id = req.params?.id
    const doc = await Service.detail({ orgId: org.value, id })
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Ticket no encontrado' })
    res.json(doc)
  } catch (e) {
    next(e)
  }
}

export async function create(req, res, next) {
  try {
    const body = req.body || {}

    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const principalR = resolvePrincipal(req, body)
    if (principalR.error)
      return res
        .status(400)
        .json({ error: true, message: principalR.error })

    // si no vino reporter, al menos setea el id
    if (!body.reporter) body.reporter = { id: principalR.value }

    const doc = await Service.create({
      orgId: org.value,
      principal: principalR.value,
      payload: body,
    })
    res.status(201).json(doc)
  } catch (e) {
    next(e)
  }
}

export async function update(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const id = req.params?.id
    const body = req.body || {}
    const doc = await Service.update({ orgId: org.value, id, payload: body })
    if (!doc)
      return res
        .status(404)
        .json({ error: true, message: 'Ticket no encontrado' })
    res.json(doc)
  } catch (e) {
    next(e)
  }
}

export async function remove(req, res, next) {
  try {
    const org = resolveOrgId(req)
    if (org.error)
      return res.status(400).json({ error: true, message: org.error })

    const id = req.params?.id
    const ok = await Service.remove({ orgId: org.value, id })
    if (!ok)
      return res
        .status(404)
        .json({ error: true, message: 'Ticket no encontrado' })
    res.json({ ok: true, id })
  } catch (e) {
    next(e)
  }
}

export async function all(req, res, next) {
  try {
    // si viene en header o query, lo uso, si no, saco todo
    const orgId =
      req.validated?.headers?.['x-org-id'] ||
      req.validated?.query?.orgId ||
      undefined

    const rows = await Service.all({ orgId })
    return res.json(rows)
  } catch (e) {
    next(e)
  }
}

/* ============================================================
   CREAR TICKET COMPLETO (ticket + mensaje + archivos + notif)
   Endpoint: POST /tikets/tickets/full
   ============================================================ */

// controller CrearTicket - BACKEND
export async function createFull(req, res, next) {
  try {
    const body = req.body || {};

    // 👉 Validar ORG
    const org = resolveOrgId(req);
    if (org.error) {
      return res.status(400).json({ error: true, message: org.error });
    }

    // 👉 Validar principalId
    const principalR = resolvePrincipal(req, body);
    if (principalR.error) {
      return res.status(400).json({ error: true, message: principalR.error });
    }

    let {
      title,
      description,
      categoryId,
      priorityId,
      statusId,
      assigneeType,
      assigneeId,
      assigneeGroup, // opcional, para grupos
      firstMessageBody,
    } = body;

    // =========================
    //  🔧 Normalización asignación
    // =========================

    const isGroup = assigneeType === "group";
    assigneeType = isGroup ? "group" : "person";

    let normalizedGroup = [];

    if (isGroup) {
      if (Array.isArray(assigneeGroup)) {
        normalizedGroup = Array.from(
          new Set(
            assigneeGroup
              .map((v) => String(v).trim())
              .filter((v) => v.length > 0)
          )
        );
      }

      if (normalizedGroup.length === 0) {
        return res.status(400).json({
          error: true,
          message:
            'Debe enviar al menos un integrante en assigneeGroup cuando assigneeType es "group".',
        });
      }
      
      // En modo grupo, dejamos que el id sea null en el modelo (no es requerido)
     // NO lo tocamos aquí, lo maneja el service según type.
    }

    const uploadedFiles = req.files || [];

    const result = await Service.createTicketPackage({
      orgId: org.value,
      principalId: principalR.value,
      ticketData: {
        title,
        description,
        categoryId,
        priorityId,
        statusId,
        assigneeType,                           // 'person' | 'group'
        assigneeId,                             // id de usuario si es persona
        assigneeGroup: isGroup ? normalizedGroup : [], // array de ids si es grupo
      },
      firstMessageBody,
      uploadedFiles,
    });
    const assigneeIds = [];

    if (!isGroup) {
      // Asignación a persona
      if (assigneeId) {
        assigneeIds.push(String(assigneeId));
      }
    } else {
      // Asignación a grupo
      normalizedGroup.forEach((id) => {
        if (id) assigneeIds.push(String(id));
      });
    }

    // Si no hay nadie asignado, no hacemos push (puede quedar solo al creador)
    if (assigneeIds.length > 0) {
      try {
        // Nombre del creador para el mensaje
        const user = req.user || {};
        const creatorName =
          user.username ||
          user.nombre ||
          `${user?.personal?.Nombre || ""} ${
            user?.personal?.Apellido || ""
          }`.trim() ||
          `Usuario ${principalR.value}`;

        // Payload base de la notificación
        const payload = {
          title: "Nuevo ticket asignado",
          body: `${creatorName} ha asignado un ticket para ti.`,
          url: "/tickets", // si luego quieres, lo cambiamos a /tickets/{id}
        };

        // Creamos notificación en Mongo + enviamos WebPush a cada asignado
        await Promise.all(
          assigneeIds.map(async (targetId) => {
            // Guardar registro de notificación
            await NotificationsService.create({
              orgId: org.value,
              principalId: String(targetId),
              type: "ticket_assigned",
              payload,
              read: false,
            });

            // Intentar enviar push (si falla, no rompemos el flujo)
            try {
              await sendPushToPrincipal(String(targetId), payload, org.value);
            } catch (pushErr) {
              console.error(
                "⚠️ Error enviando push por ticket asignado:",
                pushErr
              );
            }
          })
        );
      } catch (notifyErr) {
        console.error("⚠️ Error general en notificaciones de ticket:", notifyErr);
        // Importante: NO hacemos return ni rompemos la creación del ticket
      }
    }
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
