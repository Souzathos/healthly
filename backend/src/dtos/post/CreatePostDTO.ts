import { z } from "zod";
import { DIETS } from "../../utils/diets";

// O formulário multipart manda "" quando a dieta não foi escolhida
const dietField = z.preprocess(
    value => value === '' ? undefined : value,
    z.enum(DIETS, 'Dieta inválida').optional()
)

export const CreatePostDTO = z.object({
    description: z.string().max(1000, 'A descrição deve ter no máximo 1000 caracteres').optional(),
    diet: dietField
})

export type CreatePostDTO = z.infer<typeof CreatePostDTO>
