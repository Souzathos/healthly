import { z } from "zod";

export const SearchUsersDTO = z.object({
    // Aceita "@ana" ou "ana": o @ não faz parte do handle salvo
    q: z.string().trim().transform(value => value.replace(/^@/, '')).pipe(
        z.string().min(1, 'Digite algo para buscar').max(50, 'Busca longa demais')
    )
})

export type SearchUsersDTO = z.infer<typeof SearchUsersDTO>
