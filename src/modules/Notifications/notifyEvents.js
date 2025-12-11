import * as NotificationService from "./Service.js";
import { sendPushToPrincipal } from "./pushService.js";

/**
 * Helper base: crea registro en Mongo + dispara WebPush.
 */
async function createAndPush({ orgId, principalId, type, payload, read = false }) {
  // 1) Guardar en colección notifications
  const notif = await NotificationService.create({
    orgId,
    principalId,
    type,
    payload,
    read,
  });

  // 2) Intentar enviar WebPush (no rompemos si falla)
  try {
    await sendPushToPrincipal(principalId, {
      // Estos campos los usa tu controlador / sw.js
      title: payload.title,
      body: payload.body,
      url: payload.url,
      // Extra opcional para el service worker
      data: {
        notificationId: notif._id,
        type,
        orgId,
        principalId,
        ...payload.data,
      },
    });
  } catch (err) {
    console.error("⚠️ Error enviando push para", type, "=>", err);
  }

  return notif;
}

/* ==========================================================
   🔍 Helper: participantes de un ticket (para mensajes/eventos)
   - reporter
   - assignee (persona / team)
   - miembros de grupo (si assignee.type === 'group')
   - watchers (si existen en el ticket)
   Siempre excluye al actor (quien hizo la acción)
   ========================================================== */
export function collectRecipientsForTicketEvent(ticket, actorId) {
  const recipients = new Set();
  const actor = actorId != null ? String(actorId) : null;

  if (!ticket) return [];

  // Reporter
  if (ticket.reporter?.id != null) {
    const repId = String(ticket.reporter.id);
    if (repId && repId !== actor) {
      recipients.add(repId);
    }
  }

  // Asignación
  if (ticket.assignee) {
    const { type, id, members } = ticket.assignee || {};

    // Persona / team
    if ((type === "person" || type === "team") && id != null) {
      const assigneeId = String(id);
      if (assigneeId && assigneeId !== actor) {
        recipients.add(assigneeId);
      }
    }

    // Grupo
    if (type === "group" && Array.isArray(members)) {
      members.forEach((m) => {
        const mid = m?.id != null ? String(m.id) : null;
        if (mid && mid !== actor) {
          recipients.add(mid);
        }
      });
    }
  }

  // Watchers opcionales: [{ id }]
  if (Array.isArray(ticket.watchers)) {
    ticket.watchers.forEach((w) => {
      const wid = w?.id != null ? String(w.id) : null;
      if (wid && wid !== actor) {
        recipients.add(wid);
      }
    });
  }

  return Array.from(recipients);
}


export async function notifyTicketAssignedToPerson({
  orgId,
  assigneeId,
  ticket, 
  actor, 
}) {
  if (!assigneeId) return;

  const principalId = String(assigneeId);
  const code = ticket.code || String(ticket._id).slice(-6);
  const actorName = actor?.name || `Usuario ${actor?.id ?? ""}`.trim();

  const payload = {
    title: "Nuevo ticket asignado",
    body: `${actorName} te asignó el ticket numero: ${code}: ${ticket.title}`,
    url: `/tickets?ticketId=${ticket._id}`,
    data: {
      ticketId: ticket._id,
      code,
      actorId: actor?.id,
    },
  };

  return createAndPush({
    orgId,
    principalId,
    type: "ticket_assigned_person",
    payload,
  });
}

export async function notifyTicketAssignedToGroup({
  orgId,
  memberIds = [],
  ticket,
  actor,
}) {
  const tasks = (memberIds || []).map((memberId) =>
    notifyTicketAssignedToPerson({
      orgId,
      assigneeId: memberId,
      ticket,
      actor,
    })
  );
  return Promise.all(tasks);
}


export async function notifyTicketNewMessage({
  orgId,
  recipientId,
  ticket,
  message, 
  actor,
}) {
  if (!recipientId) return;

  const principalId = String(recipientId);
  const code = ticket.code || String(ticket._id).slice(-6);
  const actorName = actor?.name || `Usuario ${actor?.id ?? ""}`.trim();

  const text = (message || "").toString();
  const short = text.length > 140 ? text.slice(0, 137) + "..." : text;

  const payload = {
    title: `Nuevo mensaje en ticket #${code}`,
    body: `${actorName}: ${short}`,
        url: `/tickets?ticketId=${ticket._id}`,
    data: {
      ticketId: ticket._id,
      code,
      actorId: actor?.id,
    },
  };

  return createAndPush({
    orgId,
    principalId,
    type: "ticket_new_message",
    payload,
  });
}
export async function notifyTicketNewMessageToParticipants({
  orgId,
  ticket,
  message,
  actor, // { id, name }
}) {
  if (!ticket || !orgId) return;

  const actorId = actor?.id != null ? String(actor.id) : null;
  const recipients = collectRecipientsForTicketEvent(ticket, actorId);

  if (!recipients.length) {
    console.log("ℹ️ notifyTicketNewMessageToParticipants: sin destinatarios");
    return [];
  }

  const tasks = recipients.map((principalId) =>
    notifyTicketNewMessage({
      orgId,
      recipientId: principalId,
      ticket,
      message,
      actor,
    })
  );

  return Promise.all(tasks);
}

export async function notifyTicketStatusChanged({
  orgId,
  recipientId,
  ticket,
  oldStatusName,
  newStatusName,
  actor,
}) {
  if (!recipientId) return;

  const principalId = String(recipientId);
  const code = ticket.code || String(ticket._id).slice(-6);
  const actorName = actor?.name || `Usuario ${actor?.id ?? ""}`.trim();

  const payload = {
    title: `Ticket #${code} cambió de estado`,
    body: `${actorName} cambió el estado: ${oldStatusName} → ${newStatusName}`,
    url: `/tickets/${ticket._id}`,
    data: {
      ticketId: ticket._id,
      code,
      oldStatusName,
      newStatusName,
      actorId: actor?.id,
    },
  };

  return createAndPush({
    orgId,
    principalId,
    type: "ticket_status_changed",
    payload,
  });
}
