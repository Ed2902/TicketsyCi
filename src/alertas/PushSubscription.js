// src/alertas/PushSubscription.js
import mongoose from "mongoose";

const PushSubscriptionSchema = new mongoose.Schema(
  {
    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    subscription: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);



const PushSubscription =
  mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);

export default PushSubscription;
