import { z } from "zod";

export const CreatePostDTO = z.object({
    description: z.string().max(1000, 'A descrição deve ter no máximo 1000 caracteres').optional()
})

export type CreatePostDTO = z.infer<typeof CreatePostDTO>
