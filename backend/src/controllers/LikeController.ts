import { Request, Response } from "express";
import { LikeService } from "../services/LikeService";

export class LikeController {
    private service = new LikeService()

    async togglePost(req:Request, res:Response) {
        try {
            const postId = Number(req.params.postId)
            const result = await this.service.togglePost(postId, req.user!.id)

            return res.status(200).json(result)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async toggleComment(req:Request, res:Response) {
        try {
            const commentId = Number(req.params.commentId)
            const result = await this.service.toggleComment(commentId, req.user!.id)

            return res.status(200).json(result)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }
}
