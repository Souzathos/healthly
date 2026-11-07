import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { generateToken } from "../utils/jwt";

export class AuthController {
    private service = new AuthService()

    async register(req: Request, res: Response) {
        await this.service.register(req.body)

        return res.status(201).json({success: true, message: 'Usuário criado com sucesso!'})
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body
        const user = await this.service.login(email, password)
        const token = generateToken({ id: user.id, email: user.email })

        return res.status(200).json({ success: true, data: user, token })
    }
}
