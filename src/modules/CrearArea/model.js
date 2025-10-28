import mongoose from 'mongoose';

const AreaSchema = new mongoose.Schema(
  {
    orgId: { type: String, required: true, index: true },
    name:  { type: String, required: true, trim: true },
    description: { type: String },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true }
  },
  { timestamps: true }
);

// Nombre único por organización
AreaSchema.index({ orgId: 1, name: 1 }, { unique: true });

export const Area = mongoose.model('Area', AreaSchema);
