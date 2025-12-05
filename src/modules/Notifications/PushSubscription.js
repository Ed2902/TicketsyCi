// src/modules/Notifications/PushSubscription.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const PushSubscriptionSchema = new Schema(
  {
    // Multi-tenant opcional
    orgId: {
      type: String,
      index: true,
    },

    // igual que Notification.principalId => STRING
    principalId: {
      type: String,
      required: true,
      index: true,
    },

    // Objeto que viene del navegador (endpoint, keys, etc.)
    subscription: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "push_subscriptions",
  }
);

// Evita duplicados por principal + endpoint
PushSubscriptionSchema.index(
  { principalId: 1, "subscription.endpoint": 1 },
  { unique: true }
);

const PushSubscription =
  mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);

export default PushSubscription;
