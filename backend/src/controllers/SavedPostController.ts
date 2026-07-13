import { Request, Response } from "express";
import { SavedPostService } from "../services/SavedPostService";

export class SavedPostController {
    private service = new SavedPostService()

    async toggle(req:Request, res:Response) {
        try {
            const postId = Number(req.params.postId)
            const result = await this.service.toggle(postId, req.user!.id)

            return res.status(200).json(result)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async list(req:Request, res:Response) {
        try {
            const posts = await this.service.listByUser(req.user!.id)

            return res.status(200).json(posts)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }
}
