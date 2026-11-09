import { Router } from "express";
import { CommentController } from "../controllers/CommentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware";
import { validateBody, validateIds } from "../middlewares/validate";
import { CreateCommentDTO } from "../dtos/comment";

const commentRoutes = Router()
const comment = new CommentController()

commentRoutes.post('/:postId', validateIds('postId'), authMiddleware, validateBody(CreateCommentDTO), comment.create.bind(comment))
commentRoutes.get('/post/:postId', validateIds('postId'), optionalAuthMiddleware, comment.listByPost.bind(comment))
commentRoutes.delete('/:id', validateIds('id'), authMiddleware, comment.delete.bind(comment))

export default commentRoutes
