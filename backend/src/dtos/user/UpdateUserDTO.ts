import { z } from "zod";
import { passwordField } from "./RegisterDTO";

export const UpdateUserDTO = z.object({
    name: z.string().min(3, 'O nome deve ter ao menos 3 caracteres').max(255).optional(),
    handle: z.string().min(2).max(50).optional(),
    bio: z.string().max(255).optional(),
    goal: z.string().max(100).optional(),
    password: passwordField.optional(),
    currentPassword: z.string().optional()
}).refine(data => !data.password || data.currentPassword, {
    path: ['currentPassword'],
    message: 'Informe a senha atual'
})

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>
