// src/modules/Notifications/PushSubscription.js
import mongoose from "mongoose";

const PushSubscriptionSchema = new mongoose.Schema(
  {
    // 👇 aquí usamos principalId porque es como llamas al "dueño" de la notificación
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    subscription: {
      type: Object,
      required: true, // contiene endpoint, keys, etc.
    },
  },
  { timestamps: true }
);

const PushSubscription = mongoose.model(
  "PushSubscription",
  PushSubscriptionSchema
);

export default PushSubscription;
