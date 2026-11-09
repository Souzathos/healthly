import { Router } from "express";
import userRoutes from "./userRoutes";
import postRoutes from "./postRoutes";
import commentRoutes from "./commentRoutes";
import likeRoutes from "./likeRoutes";
import savedRoutes from "./savedRoutes";
import followRoutes from "./followRoutes";
import notificationRoutes from "./notificationRoutes";
import conversationRoutes from "./conversationRoutes";
import professionalRoutes from "./professionalRoutes";

const routes = Router()

routes.use('/user', userRoutes)
routes.use('/post', postRoutes)
routes.use('/comment', commentRoutes)
routes.use('/like', likeRoutes)
routes.use('/saved', savedRoutes)
routes.use('/follow', followRoutes)
routes.use('/notifications', notificationRoutes)
routes.use('/conversations', conversationRoutes)
routes.use('/professional', professionalRoutes)
export default routes
