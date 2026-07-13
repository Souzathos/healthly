import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
    private service = new UserService()

    async profile(req:Request, res:Response) {
        try {
            const id = Number(req.params.id)
            const user = await this.service.getProfile(id)

            return res.status(200).json(user)
        } catch(e: any) {
            return res.status(404).json({message: e.message})
        }
    }
}
