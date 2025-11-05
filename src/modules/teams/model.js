import mongoose from 'mongoose';

const { Schema } = mongoose;

const MemberSchema = new Schema(
  {
    principalId: { type: String, required: true }, 
    email:       { type: String }
  },
  { _id: false }
);

const TeamSchema = new Schema(
  {
    orgId: {
      type: String,
      required: true,
      enum: ['Fastway', 'metalharvest', 'greenway'], // 👈 tus 3 empresas
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: { type: String },

    members: {
      type: [MemberSchema],
      default: []
    },

    active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'teams'
  }
);

// que no se repita el nombre de un team en la misma org
TeamSchema.index({ orgId: 1, name: 1 }, { unique: true });

export const Team =
  mongoose.models.Team || mongoose.model('Team', TeamSchema);
 
  