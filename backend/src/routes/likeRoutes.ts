import { Router } from "express";
import { LikeController } from "../controllers/LikeController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateIds } from "../middlewares/validate";

const likeRoutes = Router()
const like = new LikeController()

likeRoutes.post('/post/:postId', validateIds('postId'), authMiddleware, like.togglePost.bind(like))
likeRoutes.post('/comment/:commentId', validateIds('commentId'), authMiddleware, like.toggleComment.bind(like))

export default likeRoutes
