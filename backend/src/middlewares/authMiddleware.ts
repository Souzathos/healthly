import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export function authMiddleware(req:Request, res:Response, next:NextFunction) {
    const header = req.headers.authorization

    if(!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Token não fornecido.'})
    }


    const token = header.split(' ')[1]
    if(!token) {
        return res.status(401).json({message: 'Token mal formatado'})
    }

    const decoded = verifyToken(token) as {id: number, email: string} | null

    if(!decoded) {
        return res.status(401).json({message: 'Token inválido ou expirado'})
    }

    req.user = {id: decoded.id, email: decoded.email}
    return next()
}