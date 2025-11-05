// src/modules/Files/model.js
import mongoose from 'mongoose';

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const FileSchema = new Schema(
  {
    orgId: { type: String, required: true, index: true },
    ticketId: { type: ObjectId, ref: 'Ticket', index: true },

    ownerPrincipalId: { type: String, required: true }, // quién lo subió
    name: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },

    // aquí luego puedes meter info de S3, disco, etc.
    storage: {
      provider: { type: String, default: 'local' },
      path: { type: String }
    }
  },
  {
    timestamps: true,
    collection: 'files'
  }
);

export const File = mongoose.models.File || mongoose.model('File', FileSchema);
