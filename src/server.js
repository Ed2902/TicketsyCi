// src/server.js
import 'dotenv/config' // ✅ esto carga .env antes que cualquier otra cosa
import http from 'http'
import mongoose from 'mongoose'
import { Server as SocketIOServer } from 'socket.io'

import { createApp } from './app.js'
import { registerChatSocket } from './modules/chats/socket.chat.js'

const PORT = process.env.PORT || 3000

async function start() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI)
      console.log('✅ Mongo conectado')
    } else {
      console.warn(
        '⚠️  Falta MONGO_URI en .env (si ya conectas en otro lado, ignora esto).'
      )
    }

    const app = createApp()
    const server = http.createServer(app)

    const io = new SocketIOServer(server, {
      cors: { origin: true, credentials: true },
    })

    globalThis.__io = io

    io.on('connection', socket => {
      socket.on('user:join', ({ id_personal }) => {
        const pid = String(id_personal || '').trim()
        if (!pid) return
        socket.join(`user:${pid}`)
        socket.emit('user:joined', { room: `user:${pid}` })
      })
    })

    registerChatSocket(io)

    server.listen(PORT, () =>
      console.log(`✅ Server corriendo en puerto ${PORT}`)
    )
  } catch (err) {
    console.error('❌ Error iniciando server:', err)
    process.exit(1)
  }
}

start()
