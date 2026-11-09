import { z } from "zod";

export const SendMessageDTO = z.object({
    text: z.string().trim()
        .min(1, 'A mensagem não pode ser vazia')
        .max(1000, 'A mensagem deve ter no máximo 1000 caracteres')
})

export type SendMessageDTO = z.infer<typeof SendMessageDTO>
