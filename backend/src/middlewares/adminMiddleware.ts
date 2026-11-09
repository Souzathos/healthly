import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";

// Usa depois do authMiddleware. Lê o papel no banco: o token não guarda o papel.
export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    const user = await AppDataSource.getRepository(User).findOneBy({id: req.user!.id})

    if(user?.role !== 'admin') {
        return res.status(403).json({message: 'Acesso restrito a administradores'})
    }
    return next()
}
