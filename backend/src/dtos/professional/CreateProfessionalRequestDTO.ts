import { z } from "zod";

export const CreateProfessionalRequestDTO = z.object({
    type: z.enum(['nutritionist', 'physical_educator'], 'Escolha nutricionista ou educador físico'),
    registryNumber: z.string().trim().min(3, 'Informe o número do registro').max(30, 'Número do registro longo demais')
})

export type CreateProfessionalRequestDTO = z.infer<typeof CreateProfessionalRequestDTO>
