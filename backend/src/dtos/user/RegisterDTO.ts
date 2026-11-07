import { z } from "zod";
import { isValidCpf, normalizeCpf } from "../../utils/cpf";

// O bcrypt ignora tudo o que passa de 72 bytes
export const passwordField = z.string()
    .min(6, 'A senha deve ter ao menos 6 caracteres')
    .refine(value => Buffer.byteLength(value) <= 72, 'A senha é longa demais')

export const RegisterDTO = z.object({
    name: z.string().min(3, 'O nome deve ter ao menos 3 caracteres').max(255),
    email: z.email('E-mail inválido'),
    password: passwordField,
    cpf: z.string().transform(normalizeCpf).refine(isValidCpf, 'CPF inválido'),
    handle: z.string().min(2).max(50).optional(),
    bio: z.string().max(255).optional(),
    goal: z.string().max(100).optional()
})

export type RegisterDTO = z.infer<typeof RegisterDTO>
