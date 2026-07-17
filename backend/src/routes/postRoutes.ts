import { Router } from "express";
import { PostController } from "../controllers/PostController";
import multer from 'multer'
import { authMiddleware } from "../middlewares/authMiddleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware";
import { checkPostOwnerMiddleware } from "../middlewares/checkPostOwnerMiddleware";
import { validateBody } from "../middlewares/validate";
import { createPostSchema, updatePostSchema } from "../schemas/postSchemas";

const postRoutes = Router()
const post = new PostController()

const upload = multer({storage: multer.memoryStorage()})

// Rotas de leitura (as específicas vêm antes de /:id para não haver conflito)
postRoutes.get('/feed', authMiddleware, post.feed.bind(post))
postRoutes.get('/media/:mediaId', post.getMedia.bind(post))
postRoutes.get('/liked/:userId', optionalAuthMiddleware, post.likedByUser.bind(post))
postRoutes.get('/user/:userId', optionalAuthMiddleware, post.getByUser.bind(post))
postRoutes.get('/:id', optionalAuthMiddleware, post.getById.bind(post))

postRoutes.post('/create', authMiddleware, upload.array('images'), validateBody(createPostSchema), post.create.bind(post))
postRoutes.put('/update/:id', authMiddleware, checkPostOwnerMiddleware, upload.array('images'), validateBody(updatePostSchema), post.update.bind(post))
postRoutes.delete('/delete/:id', authMiddleware, checkPostOwnerMiddleware, post.delete.bind(post))


export default postRoutes
