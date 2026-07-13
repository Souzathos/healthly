import { Router } from "express";
import { CommentController } from "../controllers/CommentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateBody } from "../middlewares/validate";
import { createCommentSchema } from "../schemas/commentSchemas";

const commentRoutes = Router()
const comment = new CommentController()

commentRoutes.post('/:postId', authMiddleware, validateBody(createCommentSchema), comment.create.bind(comment))
commentRoutes.get('/post/:postId', comment.listByPost.bind(comment))
commentRoutes.delete('/:id', authMiddleware, comment.delete.bind(comment))

export default commentRoutes
