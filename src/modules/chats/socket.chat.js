// src/modules/chats/socket.chat.js
import { Conversation } from './model.conversation.js'
import { markRead } from './service.chat.js'

/**
 * Registra eventos Socket.IO para chats
 * Rooms: chatId
 */
export function registerChatSocket(io) {
  io.on('connection', socket => {
    // Join room
    socket.on('chat:join', async ({ chatId, id_personal }) => {
      try {
        const chat = await Conversation.findById(chatId).lean()
        if (!chat) return

        const pid = String(id_personal || '').trim()
        if (!pid || !chat.participants?.includes(pid)) return

        socket.join(String(chatId))
        socket.emit('chat:joined', { chatId })
      } catch {
        // silent
      }
    })

    // Typing start
    socket.on('chat:typing:start', async ({ chatId, id_personal }) => {
      try {
        const chat = await Conversation.findById(chatId).lean()
        if (!chat) return

        const pid = String(id_personal || '').trim()
        if (!pid || !chat.participants?.includes(pid)) return

        socket
          .to(String(chatId))
          .emit('chat:typing:start', { chatId, id_personal: pid })
      } catch {
        // silent
      }
    })

    // Typing stop
    socket.on('chat:typing:stop', async ({ chatId, id_personal }) => {
      try {
        const chat = await Conversation.findById(chatId).lean()
        if (!chat) return

        const pid = String(id_personal || '').trim()
        if (!pid || !chat.participants?.includes(pid)) return

        socket
          .to(String(chatId))
          .emit('chat:typing:stop', { chatId, id_personal: pid })
      } catch {
        // silent
      }
    })

    // Read
    socket.on('chat:read', async ({ chatId, id_personal, at }) => {
      try {
        const data = await markRead({ chatId, id_personal, at })
        io.to(String(chatId)).emit('chat:read:update', {
          chatId,
          id_personal: String(id_personal).trim(),
          lastReadAt: data.lastReadAt,
        })
      } catch {
        // silent
      }
    })
  })
}
