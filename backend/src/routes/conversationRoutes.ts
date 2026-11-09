import { Router } from "express";
import { MessageController } from "../controllers/MessageController";
import { SendMessageDTO } from "../dtos/message";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateBody, validateIds } from "../middlewares/validate";

const conversationRoutes = Router()
const message = new MessageController()

// Todas as rotas de mensagens exigem login
conversationRoutes.use(authMiddleware)

conversationRoutes.get('/', message.list.bind(message))
conversationRoutes.get('/unread-count', message.unreadCount.bind(message))
conversationRoutes.post('/with/:userId', validateIds('userId'), message.open.bind(message))
conversationRoutes.get('/:id/messages', validateIds('id'), message.messages.bind(message))
conversationRoutes.post('/:id/messages', validateIds('id'), validateBody(SendMessageDTO), message.send.bind(message))
conversationRoutes.patch('/:id/read', validateIds('id'), message.markRead.bind(message))

export default conversationRoutes
