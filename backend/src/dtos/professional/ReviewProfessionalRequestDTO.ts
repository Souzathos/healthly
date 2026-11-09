import { z } from "zod";

export const ReviewProfessionalRequestDTO = z.object({
    approve: z.boolean('Informe se o pedido foi aprovado')
})

export type ReviewProfessionalRequestDTO = z.infer<typeof ReviewProfessionalRequestDTO>
