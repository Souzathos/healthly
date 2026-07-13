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
