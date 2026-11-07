import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
    private service = new UserService()

    async profile(req: Request, res: Response) {
        const user = await this.service.getProfile(Number(req.params.id))

        return res.status(200).json(user)
    }

    async me(req: Request, res: Response) {
        const user = await this.service.getOwnProfile(req.user!.id)

        return res.status(200).json(user)
    }

    async update(req: Request, res: Response) {
        const user = await this.service.update(req.user!.id, req.body)

        return res.status(200).json(user)
    }

    async delete(req: Request, res: Response) {
        const result = await this.service.delete(req.user!.id)

        return res.status(200).json(result)
    }
}
