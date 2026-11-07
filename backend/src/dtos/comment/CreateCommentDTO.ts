import { z } from "zod";

export const CreateCommentDTO = z.object({
    text: z.string().min(1, 'O comentário não pode ser vazio').max(500, 'O comentário deve ter no máximo 500 caracteres')
})

export type CreateCommentDTO = z.infer<typeof CreateCommentDTO>
