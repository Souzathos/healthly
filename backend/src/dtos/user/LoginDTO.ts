import { z } from "zod";

export const LoginDTO = z.object({
    email: z.email('E-mail inválido'),
    password: z.string().min(1, 'A senha é obrigatória')
})

export type LoginDTO = z.infer<typeof LoginDTO>
