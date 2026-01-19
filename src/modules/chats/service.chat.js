// src/modules/chats/service.chat.js
import mongoose from 'mongoose'
import { Conversation } from './model.conversation.js'
import { Message } from './model.message.js'
import { encryptText, decryptText } from './crypto.message.js'

// ✅ Notifications
import { dispatchNotifications } from '../notifications/service.notification.js'

function uniqTrim(arr) {
  return [...new Set(arr.map(x => String(x).trim()))].filter(Boolean)
}

function parsePaging({ page, limit }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)
  const safePage = Math.max(Number(page) || 1, 1)
  const skip = (safePage - 1) * safeLimit
  return { safePage, safeLimit, skip }
}

async function assertParticipant(chatId, id_personal) {
  const chat = await Conversation.findById(chatId).lean()
  if (!chat) {
    const err = new Error('Chat no encontrado.')
    err.status = 404
    throw err
  }
  const pid = String(id_personal).trim()
  if (!chat.participants?.includes(pid)) {
    const err = new Error('No autorizado: no eres participante del chat.')
    err.status = 403
    throw err
  }
  return chat
}

/**
 * Crear chat libre
 */
export async function createFreeChat({
  id_personal,
  title = '',
  participants,
}) {
  const pid = String(id_personal).trim()
  const users = uniqTrim(participants)

  const chat = await Conversation.create({
    contextType: 'free',
    contextId: null,
    title: String(title ?? '').trim(),
    participants: users,
    activo: true,
    createdBy: pid,
    updatedBy: pid,
  })

  return chat.toObject()
}

/**
 * Listar mis chats (solo donde participo), paginado, último actualizado primero.
 * Incluye unreadCount por chat (costo: 1 count por chat en página).
 */
export async function listMyChats({
  id_personal,
  page,
  limit,
  contextType,
  search,
}) {
  const pid = String(id_personal).trim()
  const { safePage, safeLimit, skip } = parsePaging({ page, limit })

  const filter = {
    activo: true,
    participants: pid,
  }

  if (contextType) filter.contextType = contextType

  if (search && String(search).trim()) {
    const s = String(search).trim()
    filter.$or = [{ title: { $regex: s, $options: 'i' } }]
  }

  const [items, total] = await Promise.all([
    Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Conversation.countDocuments(filter),
  ])

  const enriched = await Promise.all(
    items.map(async c => {
      const lastReadAt = c.lastRead?.[pid] ? new Date(c.lastRead[pid]) : null

      const msgFilter = {
        chatId: c._id,
        sender_id_personal: { $ne: pid },
      }

      if (lastReadAt) msgFilter.createdAt = { $gt: lastReadAt }

      const unreadCount = await Message.countDocuments(msgFilter)

      return {
        ...c,
        participantsCount: c.participants?.length || 0,
        unreadCount,
        lastReadAt,
      }
    })
  )

  return {
    items: enriched,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  }
}

/**
 * Mensajes paginados (último primero) - devuelve text descifrado
 */
export async function getMessages({ chatId, id_personal, page, limit }) {
  await assertParticipant(chatId, id_personal)

  const { safePage, safeLimit, skip } = parsePaging({ page, limit })

  const [items, total] = await Promise.all([
    Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Message.countDocuments({ chatId }),
  ])

  const decrypted = items.map(m => ({
    ...m,
    text: decryptText(m),
  }))

  return {
    items: decrypted,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.ceil(total / safeLimit) || 1,
    },
  }
}

/**
 * Enviar mensaje (cifra texto) + ✅ Notificaciones automáticas + ✅ Socket realtime
 */
export async function sendMessage({
  chatId,
  id_personal,
  text,
  attachments = [],
}) {
  const chat = await assertParticipant(chatId, id_personal)
  const pid = String(id_personal).trim()

  const hasAttachments = Array.isArray(attachments) && attachments.length > 0
  const preview = hasAttachments ? 'Nuevo mensaje con adjunto' : 'Nuevo mensaje'

  const enc = encryptText(text)

  const msg = await Message.create({
    chatId: new mongoose.Types.ObjectId(chatId),
    sender_id_personal: pid,
    ...enc,
    preview,
    attachments: Array.isArray(attachments) ? attachments : [],
  })

  // actualizar lastMessage
  await Conversation.findByIdAndUpdate(chatId, {
    $set: {
      updatedBy: pid,
      lastMessage: { preview, at: new Date(), sender: pid },
    },
  })

  const messageOut = {
    ...msg.toObject(),
    text: decryptText(msg.toObject()),
  }

  // ============================
  // ✅ Realtime: mensaje al room del chat
  // ============================
  const io = globalThis.__io
  if (io) {
    io.to(String(chatId)).emit('message:new', {
      chatId: String(chatId),
      message: messageOut,
    })
  }

  // ============================
  // ✅ Notificaciones automáticas (DB + realtime)
  // ============================
  const recipients = (chat.participants || []).filter(
    p => String(p).trim() && String(p).trim() !== pid
  )

  // target de navegación al hacer click
  const ticketId =
    chat.contextType === 'ticket' && chat.contextId
      ? String(chat.contextId)
      : null

  const target = {
    type: 'chat',
    params: ticketId
      ? { chatId: String(chatId), ticketId }
      : { chatId: String(chatId) },
    url: `/chats/${String(chatId)}`,
  }

  // crea notificaciones en DB (una por usuario)
  const created = await dispatchNotifications({
    actor_id_personal: pid,
    to_ids: recipients,
    type: 'chat.message_new',
    title: 'Nuevo mensaje',
    body: preview, // genérico
    target,
    meta: {
      chatId: String(chatId),
      ...(ticketId ? { ticketId } : {}),
    },
  })

  // realtime: notificación por usuario
  if (io && created?.items?.length) {
    for (const n of created.items) {
      const to = String(n.to_id_personal || '').trim()
      if (!to) continue
      io.to(`user:${to}`).emit('notification:new', n)
    }
  }

  return messageOut
}

/**
 * Marcar chat como leído
 */
export async function markRead({ chatId, id_personal, at }) {
  const chat = await assertParticipant(chatId, id_personal)
  const pid = String(id_personal).trim()

  const lastReadAt = at ? new Date(at) : new Date()

  await Conversation.findByIdAndUpdate(chatId, {
    $set: {
      [`lastRead.${pid}`]: lastReadAt,
      updatedBy: pid,
    },
  })

  return { lastReadAt, chat }
}

/**
 * Editar participantes (solo free)
 */
export async function patchParticipants({
  chatId,
  id_personal,
  add = [],
  remove = [],
}) {
  const chat = await assertParticipant(chatId, id_personal)
  if (chat.contextType !== 'free') {
    const err = new Error(
      'Solo se pueden editar participantes en chats libres (free).'
    )
    err.status = 400
    throw err
  }

  const pid = String(id_personal).trim()

  const update = { $set: { updatedBy: pid } }

  if (Array.isArray(add) && add.length) {
    update.$addToSet = { participants: { $each: uniqTrim(add) } }
  }
  if (Array.isArray(remove) && remove.length) {
    update.$pull = { participants: { $in: uniqTrim(remove) } }
  }

  const updated = await Conversation.findByIdAndUpdate(chatId, update, {
    new: true,
  }).lean()
  if (!updated) {
    const err = new Error('Chat no encontrado.')
    err.status = 404
    throw err
  }

  if (!updated.participants || updated.participants.length < 2) {
    const err = new Error(
      'participants no puede quedar con menos de 2 personas en chat libre.'
    )
    err.status = 400
    throw err
  }

  return updated
}

export async function deactivateChat({ chatId, id_personal }) {
  await assertParticipant(chatId, id_personal)
  const pid = String(id_personal).trim()

  const updated = await Conversation.findByIdAndUpdate(
    chatId,
    { $set: { activo: false, updatedBy: pid } },
    { new: true }
  ).lean()

  return updated
}

/**
 * ===========================
 * Helpers para Tickets
 * ===========================
 */
export function buildTicketParticipants({
  creado_por,
  watchers,
  assignedPersonals,
  apoyo_ids,
}) {
  const set = new Set()

  if (creado_por) set.add(String(creado_por).trim())
  ;(watchers || []).forEach(x => set.add(String(x).trim()))
  ;(assignedPersonals || []).forEach(x => set.add(String(x).trim()))
  ;(apoyo_ids || []).forEach(x => set.add(String(x).trim()))

  return [...set].filter(Boolean)
}

export async function ensureTicketChat({
  ticketId,
  participants,
  actor_id_personal,
}) {
  const pid = String(actor_id_personal).trim()

  const chat = await Conversation.findOneAndUpdate(
    { contextType: 'ticket', contextId: new mongoose.Types.ObjectId(ticketId) },
    {
      $setOnInsert: {
        contextType: 'ticket',
        contextId: new mongoose.Types.ObjectId(ticketId),
        title: '',
        activo: true,
        createdBy: pid,
      },
      $set: {
        participants: uniqTrim(participants),
        updatedBy: pid,
      },
    },
    { upsert: true, new: true }
  ).lean()

  return chat
}

export async function syncTicketChat({
  ticketId,
  participants,
  actor_id_personal,
}) {
  const pid = String(actor_id_personal).trim()

  const updated = await Conversation.findOneAndUpdate(
    { contextType: 'ticket', contextId: new mongoose.Types.ObjectId(ticketId) },
    {
      $set: {
        participants: uniqTrim(participants),
        updatedBy: pid,
      },
    },
    { new: true }
  ).lean()

  if (!updated) {
    return ensureTicketChat({ ticketId, participants, actor_id_personal: pid })
  }
  return updated
}
