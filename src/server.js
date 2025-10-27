require('dotenv').config()
const { createApp } = require('./app')
const { connectDB } = require('./config/db')

const PORT = process.env.PORT || 4000
const ALLOW =
  String(process.env.ALLOW_START_WITHOUT_DB || '').toLowerCase() === 'true'

;(async () => {
  try {
    try {
      await connectDB()
    } catch (dbErr) {
      if (!ALLOW) throw dbErr
      console.warn(
        '⚠️  No se pudo conectar a Mongo, pero ALLOW_START_WITHOUT_DB=true. Arrancando sin DB.'
      )
    }

    const app = createApp()

    // ✅ Ya NO montamos Swagger aquí; está en app.js
    app.listen(PORT, () => console.log(`🚀 Server en http://localhost:${PORT}`))
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message)
    process.exit(1)
  }
})()
