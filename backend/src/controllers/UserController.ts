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

    async me(req:Request, res:Response) {
        try {
            const user = await this.service.getProfile(req.user!.id)

            return res.status(200).json(user)
        } catch(e: any) {
            return res.status(404).json({message: e.message})
        }
    }

    async update(req:Request, res:Response) {
        try {
            const user = await this.service.update(req.user!.id, req.body)

            return res.status(200).json(user)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async delete(req:Request, res:Response) {
        try {
            const result = await this.service.delete(req.user!.id)

            return res.status(200).json(result)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }
}
