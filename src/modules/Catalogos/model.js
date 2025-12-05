// src/modules/Catalogos/model.js
import mongoose from 'mongoose'

const { Schema, model } = mongoose

// CATEGORÍAS
const ticketCategorySchema = new Schema(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#0ea5e9' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const TicketCategory = model('TicketCategory', ticketCategorySchema)

// PRIORIDADES
const ticketPrioritySchema = new Schema(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#22c55e' },
    weight: { type: Number, required: true, min: 1 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const TicketPriority = model('TicketPriority', ticketPrioritySchema)

// ESTADOS
const ticketStatusSchema = new Schema(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#0f172a' },
    order: { type: Number, required: true, min: 1 },
    isClosed: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const TicketStatus = model('TicketStatus', ticketStatusSchema)
