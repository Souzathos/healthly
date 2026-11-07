import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware";
import { checkPostOwnerMiddleware } from "../middlewares/checkPostOwnerMiddleware";
import { validateBody, validateIds } from "../middlewares/validate";
import { uploadImages } from "../middlewares/upload";
import { createPostSchema, updatePostSchema } from "../schemas/postSchemas";

const postRoutes = Router()
const post = new PostController()

// Rotas de leitura (as específicas vêm antes de /:id para não haver conflito)
postRoutes.get('/feed', authMiddleware, post.feed.bind(post))
postRoutes.get('/media/:mediaId', validateIds('mediaId'), post.getMedia.bind(post))
postRoutes.get('/liked', authMiddleware, post.likedByUser.bind(post))
postRoutes.get('/user/:userId', validateIds('userId'), optionalAuthMiddleware, post.getByUser.bind(post))
postRoutes.get('/:id', validateIds('id'), optionalAuthMiddleware, post.getById.bind(post))

postRoutes.post('/create', authMiddleware, uploadImages, validateBody(createPostSchema), post.create.bind(post))
postRoutes.put('/update/:id', validateIds('id'), authMiddleware, checkPostOwnerMiddleware, uploadImages, validateBody(updatePostSchema), post.update.bind(post))
postRoutes.delete('/delete/:id', validateIds('id'), authMiddleware, checkPostOwnerMiddleware, post.delete.bind(post))


export default postRoutes
