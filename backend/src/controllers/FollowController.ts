import { Request, Response } from "express";
import { FollowService } from "../services/FollowService";
import { getPagination } from "../utils/pagination";

export class FollowController {
    private service = new FollowService()

    async toggle(req: Request, res: Response) {
        const result = await this.service.toggle(Number(req.params.userId), req.user!.id)

        return res.status(200).json(result)
    }

    async followers(req: Request, res: Response) {
        const users = await this.service.listFollowers(Number(req.params.userId), getPagination(req))

        return res.status(200).json(users)
    }

    async following(req: Request, res: Response) {
        const users = await this.service.listFollowing(Number(req.params.userId), getPagination(req))

        return res.status(200).json(users)
    }
}
