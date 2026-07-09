import { Router } from "express";
import { PostController } from "../controllers/PostController";
import multer from 'multer'
import { authMiddleware } from "../middlewares/authMiddleware";
import { checkPostOwnerMiddleware } from "../middlewares/checkPostOwnerMiddleware";

const postRoutes = Router()
const post = new PostController()

const upload = multer({storage: multer.memoryStorage()})

postRoutes.post('/create/:id', authMiddleware, upload.array('images'), post.create.bind(post))
postRoutes.put('/update/:id', authMiddleware, checkPostOwnerMiddleware, upload.array('images'), post.update.bind(post))
postRoutes.delete('/delete/:id', authMiddleware, checkPostOwnerMiddleware, post.delete.bind(post))


export default postRoutes