const cors = require('cors')

function buildCors() {
  const origins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if (!origins.length) return cors() // abierto en dev
  return cors({
    origin: (origin, cb) =>
      !origin || origins.includes(origin)
        ? cb(null, true)
        : cb(new Error('CORS blocked')),
    credentials: true,
  })
}

module.exports = { buildCors }
