import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(3, 'O nome deve ter ao menos 3 caracteres').max(255),
    email: z.email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
    cpf: z.string().min(11, 'CPF inválido').max(14)
})

export const loginSchema = z.object({
    email: z.email('E-mail inválido'),
    password: z.string().min(1, 'A senha é obrigatória')
})
