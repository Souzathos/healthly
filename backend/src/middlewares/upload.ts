import { NextFunction, Request, Response } from "express";
import multer from "multer";

export const MAX_IMAGES_PER_POST = 4
const MAX_IMAGE_SIZE_MB = 10

const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
])

export function isAllowedImageType(mimeType: string) {
    return ALLOWED_IMAGE_TYPES.has(mimeType)
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
        files: MAX_IMAGES_PER_POST
    },
    fileFilter: (_req, file, callback) => {
        if (isAllowedImageType(file.mimetype)) return callback(null, true)
        callback(new Error('Formato de imagem não permitido'))
    }
})

function uploadErrorResponse(error: unknown) {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return {status: 413, message: `Cada imagem pode ter até ${MAX_IMAGE_SIZE_MB} MB`}
        }
        if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
            return {status: 400, message: `Envie até ${MAX_IMAGES_PER_POST} imagens`}
        }
        return {status: 400, message: 'Não foi possível processar o envio'}
    }
    if (error instanceof Error && error.message === 'Formato de imagem não permitido') {
        return {status: 415, message: error.message}
    }
    return {status: 400, message: 'Não foi possível processar o envio'}
}

// Responde erros de upload em JSON, no mesmo formato das demais rotas
export function uploadImages(req: Request, res: Response, next: NextFunction) {
    upload.array('images', MAX_IMAGES_PER_POST)(req, res, (error: unknown) => {
        if (!error) return next()

        const {status, message} = uploadErrorResponse(error)
        return res.status(status).json({message})
    })
}
