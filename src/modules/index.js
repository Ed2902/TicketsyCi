import { Router } from 'express';
const router = Router();

// Ruta de prueba
router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    message: '✅ Servicio operativo desde routes',
    timestamp: new Date().toISOString()
  });
});

export default router;
