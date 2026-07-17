import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";


export function optionalAuthMiddleware(req:Request, res:Response, next:NextFunction) {
    const header = req.headers.authorization

    if(!header || !header.startsWith('Bearer ')) {
        return next()
    }

    const token = header.split(' ')[1]
    if(!token) {
        return next()
    }

    const decoded = verifyToken(token) as {id: number, email: string} | null

    if(decoded) {
        req.user = {id: decoded.id, email: decoded.email}
    }

    return next()
}
