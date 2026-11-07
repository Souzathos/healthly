import { z } from "zod";

export const MAX_LIMIT = 100

export const PaginationDTO = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional()
})

export type PaginationDTO = z.infer<typeof PaginationDTO>
