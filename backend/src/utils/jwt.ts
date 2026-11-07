import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export const generateToken = (payload: object) => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN
    })
}

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, env.JWT_SECRET)
    } catch {
        return null
    }
}
