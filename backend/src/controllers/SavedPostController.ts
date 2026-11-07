import { Request, Response } from "express";
import { SavedPostService } from "../services/SavedPostService";
import { getPagination } from "../utils/pagination";

export class SavedPostController {
    private service = new SavedPostService()

    async toggle(req: Request, res: Response) {
        const result = await this.service.toggle(Number(req.params.postId), req.user!.id)

        return res.status(200).json(result)
    }

    async list(req: Request, res: Response) {
        const posts = await this.service.listByUser(req.user!.id, getPagination(req))

        return res.status(200).json(posts)
    }
}
