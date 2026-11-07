import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

// Valida o corpo da requisição contra um schema zod antes de chegar no controller
export function validateBody(schema: ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)

        if(!result.success) {
            const errors = result.error.issues.map(issue => ({
                campo: issue.path.join('.'),
                mensagem: issue.message
            }))
            return res.status(400).json({message: 'Dados inválidos', errors})
        }

        req.body = result.data
        return next()
    }
}

// Recusa ids de rota que não sejam inteiros positivos, como /post/abc
export function validateIds(...names: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const valid = names.every(name => {
            const value = String(req.params[name])
            return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))
        })

        if(!valid) return res.status(400).json({message: 'Identificador inválido'})
        return next()
    }
}
