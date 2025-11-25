import { Router } from "express";
import PushSubscription from "../alertas/PushSubscription.js";
import { sendPushToUser } from "../alertas/pushService.js"

const router = Router();

// Aquí el frontend enviará: { userId, subscription }
router.post("/subscribe", async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({ msg: "Datos incompletos" });
    }

    await PushSubscription.findOneAndUpdate(
      { userId },
      { subscription },
      { upsert: true }
    );

    return res.json({ msg: "Suscripción guardada" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
});
router.post("/test", async (req, res) => {
  try {
    const { userId } = req.body;

    await sendPushToUser(userId, {
      title: "Notificación de prueba",
      body: "Todo funciona correctamente.",
      url: "https://google.com" // o a donde quieras que lleve
    });

    return res.json({ msg: "Notificación enviada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error enviando push" });
  }
});
export default router;
