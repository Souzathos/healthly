import { Request, Response } from "express";
import { CommentService } from "../services/CommentService";

export class CommentController {
    private service = new CommentService()

    async create(req:Request, res:Response) {
        try {
            const postId = Number(req.params.postId)
            const {text} = req.body
            const comment = await this.service.create(text, postId, req.user!.id)

            return res.status(201).json(comment)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async listByPost(req:Request, res:Response) {
        try {
            const postId = Number(req.params.postId)
            const comments = await this.service.listByPost(postId)

            return res.status(200).json(comments)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async delete(req:Request, res:Response) {
        try {
            const id = Number(req.params.id)
            const result = await this.service.delete(id, req.user!.id)

            return res.status(200).json(result)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }
}
