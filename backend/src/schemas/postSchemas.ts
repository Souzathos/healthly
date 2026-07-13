import { z } from "zod";

export const createPostSchema = z.object({
    description: z.string().max(1000, 'A descrição deve ter no máximo 1000 caracteres').optional()
})

export const updatePostSchema = z.object({
    description: z.string().max(1000, 'A descrição deve ter no máximo 1000 caracteres').optional()
})
