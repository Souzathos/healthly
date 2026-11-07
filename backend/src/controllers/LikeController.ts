import { Request, Response } from "express";
import { LikeService } from "../services/LikeService";

export class LikeController {
    private service = new LikeService()

    async togglePost(req: Request, res: Response) {
        const result = await this.service.togglePost(Number(req.params.postId), req.user!.id)

        return res.status(200).json(result)
    }

    async toggleComment(req: Request, res: Response) {
        const result = await this.service.toggleComment(Number(req.params.commentId), req.user!.id)

        return res.status(200).json(result)
    }
}
