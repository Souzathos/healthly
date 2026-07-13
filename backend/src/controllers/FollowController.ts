import { Request, Response } from "express";
import { FollowService } from "../services/FollowService";

export class FollowController {
    private service = new FollowService()

    async toggle(req:Request, res:Response) {
        try {
            const targetId = Number(req.params.userId)
            const result = await this.service.toggle(targetId, req.user!.id)

            return res.status(200).json(result)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async followers(req:Request, res:Response) {
        try {
            const userId = Number(req.params.userId)
            const users = await this.service.listFollowers(userId)

            return res.status(200).json(users)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async following(req:Request, res:Response) {
        try {
            const userId = Number(req.params.userId)
            const users = await this.service.listFollowing(userId)

            return res.status(200).json(users)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }
}
