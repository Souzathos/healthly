import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { optionalAuthMiddleware } from "../middlewares/optionalAuthMiddleware";
import { checkPostOwnerMiddleware } from "../middlewares/checkPostOwnerMiddleware";
import { validateBody, validateIds } from "../middlewares/validate";
import { uploadImages } from "../middlewares/upload";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/post";

const postRoutes = Router()
const post = new PostController()

// Rotas de leitura (as específicas vêm antes de /:id para não haver conflito)
postRoutes.get('/feed', authMiddleware, post.feed.bind(post))
postRoutes.get('/explore', authMiddleware, post.explore.bind(post))
postRoutes.get('/search', optionalAuthMiddleware, post.search.bind(post))
postRoutes.get('/hashtag/:tag', optionalAuthMiddleware, post.byHashtag.bind(post))
postRoutes.get('/trending-hashtags', post.trending.bind(post))
postRoutes.get('/media/:mediaId', validateIds('mediaId'), post.getMedia.bind(post))
postRoutes.get('/liked', authMiddleware, post.likedByUser.bind(post))
postRoutes.get('/user/:userId', validateIds('userId'), optionalAuthMiddleware, post.getByUser.bind(post))
postRoutes.get('/:id', validateIds('id'), optionalAuthMiddleware, post.getById.bind(post))

postRoutes.post('/:id/repost', validateIds('id'), authMiddleware, post.repost.bind(post))
postRoutes.post('/create', authMiddleware, uploadImages, validateBody(CreatePostDTO), post.create.bind(post))
postRoutes.put('/update/:id', validateIds('id'), authMiddleware, checkPostOwnerMiddleware, uploadImages, validateBody(UpdatePostDTO), post.update.bind(post))
postRoutes.delete('/delete/:id', validateIds('id'), authMiddleware, checkPostOwnerMiddleware, post.delete.bind(post))


export default postRoutes
