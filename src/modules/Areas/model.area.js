// src/modules/areas/model.area.js
import mongoose from 'mongoose'

const { Schema } = mongoose

const AreaSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    nombre_normalizado: { type: String, required: true, trim: true }, // para únicos sin líos de mayúsculas
    descripcion: { type: String, default: '', trim: true },

    // ✅ IDs del personal (vienen del otro sistema)
    // Antes era ObjectId ref 'personal', pero tu sistema usa id_personal string.
    personal_ids: [{ type: String, trim: true }],

    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Único por nombre normalizado
AreaSchema.index({ nombre_normalizado: 1 }, { unique: true })

AreaSchema.pre('validate', function (next) {
  if (this.nombre) {
    this.nombre_normalizado = this.nombre.toLowerCase().trim()
  }
  next()
})

export const Area = mongoose.model('Area', AreaSchema, 'areas')
