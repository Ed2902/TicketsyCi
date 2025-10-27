const mongoose = require('mongoose')

function buildMongoUri() {
  const { MONGODB_URI, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } =
    process.env
  if (MONGODB_URI) return MONGODB_URI
  if (DB_USER && DB_PASS) {
    return `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
  }
  return `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`
}

async function connectDB() {
  const uri = buildMongoUri()
  mongoose.set('strictQuery', true)

  mongoose.connection.on('connected', () => console.log('✅ MongoDB conectado'))
  mongoose.connection.on('error', err =>
    console.error('❌ Error MongoDB:', err.message)
  )
  mongoose.connection.on('disconnected', () =>
    console.log('⚠️  MongoDB desconectado')
  )

  await mongoose.connect(uri)
}

module.exports = { connectDB }
