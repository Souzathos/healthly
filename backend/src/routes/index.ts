import { Router } from "express";
import userRoutes from "./userRoutes";
import postRoutes from "./postRoutes";

const routes = Router()

routes.use('/user', userRoutes)
routes.use('/post', postRoutes)
export default routes