import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateIds } from "../middlewares/validate";

const notificationRoutes = Router()
const notification = new NotificationController()

notificationRoutes.get('/', authMiddleware, notification.list.bind(notification))
notificationRoutes.get('/unread-count', authMiddleware, notification.unreadCount.bind(notification))
notificationRoutes.patch('/read-all', authMiddleware, notification.markAllRead.bind(notification))
notificationRoutes.patch('/:id/read', validateIds('id'), authMiddleware, notification.markRead.bind(notification))

export default notificationRoutes
