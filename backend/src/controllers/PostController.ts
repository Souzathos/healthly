import { Request, Response } from "express";
import { PostService } from "../services/PostService";

export class PostController {
    private service = new PostService()

    async create(req:Request, res:Response) {
        try{
            const user = req.user!.id
            const files = req.files as Express.Multer.File[]
            const {description} = req.body
            const post = await this.service.create({description}, user, files)

            return res.status(201).json(post)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }

    }

    async feed(req:Request, res:Response) {
        try {
            const page = Number(req.query.page) || 1
            const posts = await this.service.getFeed(req.user!.id, page)

            return res.status(200).json(posts)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async getById(req:Request, res:Response) {
        try {
            const id = Number(req.params.id)
            const post = await this.service.getById(id, req.user?.id)

            return res.status(200).json(post)
        } catch(e: any) {
            return res.status(404).json({message: e.message})
        }
    }

    async getByUser(req:Request, res:Response) {
        try {
            const userId = Number(req.params.userId)
            const posts = await this.service.getByUser(userId, req.user?.id)

            return res.status(200).json(posts)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async likedByUser(req:Request, res:Response) {
        try {
            const posts = await this.service.getLikedByUser(req.user!.id)

            return res.status(200).json(posts)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async getMedia(req:Request, res:Response) {
        try {
            const mediaId = Number(req.params.mediaId)
            const media = await this.service.getMedia(mediaId)

            res.setHeader('Content-Type', media.mimeType)
            return res.send(media.data)
        } catch(e: any) {
            return res.status(404).json({message: e.message})
        }
    }

    async update(req:Request, res:Response) {
        try {
            const files = req.files as Express.Multer.File[]
            const {description} = req.body

            const updatedPost = await this.service.update({description}, req.post!, files)
            return res.status(200).json(updatedPost)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async delete(req:Request, res:Response) {
        try {
            const id = Number(req.params.id)
            const post = await this.service.delete(id)

            return res.status(200).json(post)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }
}