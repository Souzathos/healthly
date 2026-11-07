import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors";

export function notFoundHandler(_req: Request, res: Response) {
    return res.status(404).json({message: 'Rota não encontrada'})
}

// O Express só reconhece o handler de erro pelos 4 parâmetros
export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
    if(error instanceof AppError) {
        return res.status(error.status).json({message: error.message})
    }
    if(error.type === 'entity.parse.failed') {
        return res.status(400).json({message: 'JSON inválido'})
    }
    if(error.type === 'entity.too.large') {
        return res.status(413).json({message: 'Conteúdo grande demais'})
    }
    // Duas requisições simultâneas podem passar pelas checagens dos services
    if(error.driverError?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({message: 'Registro já existe'})
    }

    console.error(error)
    return res.status(500).json({message: 'Erro interno do servidor'})
}
