const { Router } = require('express')
const router = Router()

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'tickets', ts: new Date().toISOString() })
})

module.exports = router
