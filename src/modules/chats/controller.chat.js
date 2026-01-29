// src/modules/chats/controller.chat.js
import * as ChatService from './service.chat.js'

export async function listMyChats(req, res) {
  try {
    const data = await ChatService.listMyChats(req.query)
    return res.json({ ok: true, ...data })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error listando chats' })
  }
}

export async function createFreeChat(req, res) {
  try {
    const chat = await ChatService.createFreeChat(req.body)
    return res.status(201).json({ ok: true, chat })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error creando chat' })
  }
}

export async function getMessages(req, res) {
  try {
    const { chatId } = req.params
    const data = await ChatService.getMessages({ chatId, ...req.query })
    return res.json({ ok: true, ...data })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error obteniendo mensajes' })
  }
}

export async function sendMessage(req, res) {
  try {
    const { chatId } = req.params
    const message = await ChatService.sendMessage({ chatId, ...req.body })

    const io = globalThis.__io
    if (io) {
      io.to(String(chatId)).emit('chat:message:new', {
        chatId,
        message,
      })

      if (message?.to_id_personal) {
        io.to(`user:${message.to_id_personal}`).emit('notification:new', {
          type: 'chat.message',
          chatId,
          messageId: message._id,
          title: 'Nuevo mensaje',
          body: message.body || '',
          createdAt: message.createdAt,
        })
      }
    }

    return res.status(201).json({ ok: true, message })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error enviando mensaje' })
  }
}

export async function markRead(req, res) {
  try {
    const { chatId } = req.params
    const data = await ChatService.markRead({ chatId, ...req.body })

    const io = globalThis.__io
    if (io) {
      io.to(String(chatId)).emit('chat:read:update', {
        chatId,
        id_personal: String(req.body.id_personal || '').trim(),
        lastReadAt: data.lastReadAt,
      })
    }

    return res.json({ ok: true, lastReadAt: data.lastReadAt })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error marcando leído' })
  }
}

export async function patchParticipants(req, res) {
  try {
    const { chatId } = req.params
    const chat = await ChatService.patchParticipants({ chatId, ...req.body })

    const io = globalThis.__io
    if (io) {
      io.to(String(chatId)).emit('chat:participants:update', {
        chatId,
        participants: chat.participants,
      })
    }

    return res.json({ ok: true, chat })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error editando participantes' })
  }
}

export async function deactivateChat(req, res) {
  try {
    const { chatId } = req.params
    const chat = await ChatService.deactivateChat({ chatId, ...req.body })

    const io = globalThis.__io
    if (io) {
      io.to(String(chatId)).emit('chat:deactivated', { chatId })
    }

    return res.json({ ok: true, chat })
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ ok: false, error: e.message || 'Error desactivando chat' })
  }
}
