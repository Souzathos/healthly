import { Router } from "express";
import { PostController } from "../controllers/PostController";
import multer from 'multer'

const postRoutes = Router()
const post = new PostController()

const upload = multer({storage: multer.memoryStorage()})

postRoutes.post('/create/:id', upload.array('images'), post.create.bind(post))


export default postRoutes