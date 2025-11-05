// src/modules/CrearArea/model.js
import mongoose from 'mongoose';
import { ORG_ENUM } from '../CrearTicket/model.js'; // reutilizamos el enum: fastway, metalharvest, greenway

const { Schema } = mongoose;

const AreaSchema = new Schema(
  {
    orgId: {
      type: String,
      enum: ORG_ENUM,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: String // principalId de quien creó el área
    }
  },
  {
    timestamps: true,
    collection: 'areas'
  }
);

// no permitir 2 áreas con el mismo nombre dentro de la misma empresa
AreaSchema.index({ orgId: 1, name: 1 }, { unique: true });

export const Area =
  mongoose.models.Area || mongoose.model('Area', AreaSchema);
