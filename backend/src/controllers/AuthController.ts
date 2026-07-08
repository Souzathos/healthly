import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { generateToken } from "../utils/jwt";

export class AuthController {
    private service = new AuthService()

    async register(req: Request, res:Response) {
        try {
            const data = req.body
            const user = await this.service.register(data)
            return res.status(201).json({
                sucess: true,
                message: 'Usuário criado com sucesso!'
            })
        } catch(e: any) {
            return res.status(400).json({sucess: false,
            message: e.message})
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const user = await this.service.login(email, password)
    
            const token = generateToken({ id: user.id, email: user.email })
    
            return res.status(200).json({ sucess: true, data: user, token })
        } catch(e: any) {
            return res.status(401).json({ sucess: false, message: e.message })
        }
    }
}