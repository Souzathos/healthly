import { rateLimit } from "express-rate-limit";

const message = {message: 'Muitas tentativas. Tente novamente em alguns minutos.'}

// Conta só as falhas, para não bloquear quem entra com a senha certa
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message
})

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message
})
