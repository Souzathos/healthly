import { Router } from "express";
import { LikeController } from "../controllers/LikeController";
import { authMiddleware } from "../middlewares/authMiddleware";

const likeRoutes = Router()
const like = new LikeController()

likeRoutes.post('/post/:postId', authMiddleware, like.togglePost.bind(like))
likeRoutes.post('/comment/:commentId', authMiddleware, like.toggleComment.bind(like))

export default likeRoutes
