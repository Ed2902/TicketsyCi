// src/modules/chats/routes.chat.js
import { Router } from 'express'
import * as ChatController from './controller.chat.js'
import {
  validatePaging,
  validateListMyChats,
  validateCreateFreeChat,
  validateChatIdParam,
  validateGetMessages,
  validateSendMessage,
  validatePatchRead,
  validatePatchParticipants,
  validateDeactivate,
} from './validator.chat.js'

import { uploadAny } from '../../middlewares/uploadAny.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chats libres y chats asociados a tickets (mensajes cifrados en DB)
 */

/**
 * @swagger
 * /chats:
 *   get:
 *     summary: Listar mis chats (solo donde participo) - paginado
 *     tags: [Chats]
 *     parameters:
 *       - in: query
 *         name: id_personal
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         required: true
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         required: true
 *         schema: { type: integer, example: 20 }
 *       - in: query
 *         name: contextType
 *         required: false
 *         schema: { type: string, enum: [ticket, free] }
 *       - in: query
 *         name: search
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista paginada de chats
 */
router.get('/', validatePaging, validateListMyChats, ChatController.listMyChats)

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Crear chat libre (sin ticket)
 *     tags: [Chats]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_personal, participants]
 *             properties:
 *               id_personal:
 *                 type: string
 *                 description: Actor que crea el chat
 *               title:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items: { type: string }
 *                 description: Debe incluir al actor. Mínimo 2.
 *     responses:
 *       201:
 *         description: Chat creado
 */
router.post('/', validateCreateFreeChat, ChatController.createFreeChat)

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   get:
 *     summary: Obtener mensajes de un chat (paginado, último primero)
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: id_personal
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         required: true
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         required: true
 *         schema: { type: integer, example: 50 }
 *     responses:
 *       200:
 *         description: Mensajes paginados
 */
router.get(
  '/:chatId/messages',
  validateChatIdParam,
  validatePaging,
  validateGetMessages,
  ChatController.getMessages
)

/**
 * @swagger
 * /chats/{chatId}/messages:
 *   post:
 *     summary: Enviar mensaje (texto cifrado en DB, preview genérico)
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_personal]
 *             properties:
 *               id_personal: { type: string }
 *               text: { type: string }
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fileId: { type: string }
 *                     name: { type: string }
 *                     url: { type: string }
 *                     mime: { type: string }
 *                     size: { type: number }
 *     responses:
 *       201:
 *         description: Mensaje creado
 */
router.post(
  '/:chatId/messages',
  validateChatIdParam,
  validateSendMessage,
  ChatController.sendMessage
)

/**
 * @swagger
 * /chats/{chatId}/read:
 *   patch:
 *     summary: Marcar chat como leído (lastRead por usuario)
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_personal]
 *             properties:
 *               id_personal: { type: string }
 *               at:
 *                 type: string
 *                 format: date-time
 *                 description: Opcional. Si no se envía, se usa now.
 *     responses:
 *       200:
 *         description: lastRead actualizado
 */
router.patch(
  '/:chatId/read',
  validateChatIdParam,
  validatePatchRead,
  ChatController.markRead
)

/**
 * @swagger
 * /chats/{chatId}/participants:
 *   patch:
 *     summary: Editar participantes (solo chat free)
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_personal]
 *             properties:
 *               id_personal: { type: string }
 *               add:
 *                 type: array
 *                 items: { type: string }
 *               remove:
 *                 type: array
 *                 items: { type: string }
 */
router.patch(
  '/:chatId/participants',
  validateChatIdParam,
  validatePatchParticipants,
  ChatController.patchParticipants
)

/**
 * @swagger
 * /chats/{chatId}/deactivate:
 *   patch:
 *     summary: Desactivar chat (soft delete)
 *     tags: [Chats]
 */
router.patch(
  '/:chatId/deactivate',
  validateChatIdParam,
  validateDeactivate,
  ChatController.deactivateChat
)

/**
 * @swagger
 * /chats/{chatId}/attachments:
 *   post:
 *     summary: Subir adjuntos al chat (multipart/form-data files[])
 *     tags: [Chats]
 */
router.post(
  '/:chatId/attachments',
  validateChatIdParam,
  uploadAny.array('files', 10),
  async (req, res) => {
    const { chatId } = req.params
    const files = (req.files || []).map(f => ({
      fileId: f.filename,
      name: f.originalname,
      url: `/uploads/chats/${chatId}/${f.filename}`,
      mime: f.mimetype,
      size: f.size,
    }))
    return res.status(201).json({ ok: true, files })
  }
)

export default router
