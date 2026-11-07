import { Router } from "express";
import { CommentController } from "../controllers/CommentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateBody, validateIds } from "../middlewares/validate";
import { createCommentSchema } from "../schemas/commentSchemas";

const commentRoutes = Router()
const comment = new CommentController()

commentRoutes.post('/:postId', validateIds('postId'), authMiddleware, validateBody(createCommentSchema), comment.create.bind(comment))
commentRoutes.get('/post/:postId', validateIds('postId'), comment.listByPost.bind(comment))
commentRoutes.delete('/:id', validateIds('id'), authMiddleware, comment.delete.bind(comment))

export default commentRoutes
