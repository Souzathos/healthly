import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { SearchUsersDTO } from "../dtos/user";
import { BadRequestError } from "../errors";
import { getPagination } from "../utils/pagination";

export class UserController {
    private service = new UserService()

    async profile(req: Request, res: Response) {
        const user = await this.service.getProfile(Number(req.params.id), req.user?.id)

        return res.status(200).json(user)
    }

    async search(req: Request, res: Response) {
        const result = SearchUsersDTO.safeParse({q: req.query.q ?? ''})
        if(!result.success) throw new BadRequestError(result.error.issues[0].message)

        const users = await this.service.search(result.data.q, getPagination(req), req.user?.id)

        return res.status(200).json(users)
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
