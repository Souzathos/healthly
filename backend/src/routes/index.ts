import { Router } from "express";
import userRoutes from "./userRoutes";
import postRoutes from "./postRoutes";
import commentRoutes from "./commentRoutes";
import likeRoutes from "./likeRoutes";
import savedRoutes from "./savedRoutes";
import followRoutes from "./followRoutes";

const routes = Router()

routes.use('/user', userRoutes)
routes.use('/post', postRoutes)
routes.use('/comment', commentRoutes)
routes.use('/like', likeRoutes)
routes.use('/saved', savedRoutes)
routes.use('/follow', followRoutes)
export default routes
