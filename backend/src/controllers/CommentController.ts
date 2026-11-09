import { Request, Response } from "express";
import { CommentService } from "../services/CommentService";
import { getPagination } from "../utils/pagination";

export class CommentController {
    private service = new CommentService()

    async create(req: Request, res: Response) {
        const comment = await this.service.create(req.body.text, Number(req.params.postId), req.user!.id)

        return res.status(201).json(comment)
    }

    async listByPost(req: Request, res: Response) {
        const comments = await this.service.listByPost(Number(req.params.postId), getPagination(req), req.user?.id)

        return res.status(200).json(comments)
    }

    async delete(req: Request, res: Response) {
        const result = await this.service.delete(Number(req.params.id), req.user!.id)

        return res.status(200).json(result)
    }
}
