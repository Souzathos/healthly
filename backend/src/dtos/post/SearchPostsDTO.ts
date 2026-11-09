import { z } from "zod";
import { DIETS } from "../../utils/diets";

export const SearchPostsDTO = z.object({
    q: z.string().trim().max(100, 'Busca longa demais').optional(),
    diet: z.enum(DIETS, 'Dieta inválida').optional()
})

export type SearchPostsDTO = z.infer<typeof SearchPostsDTO>
