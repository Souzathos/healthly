import { Request } from "express";
import { z } from "zod";
import { BadRequestError } from "./errors";

const MAX_LIMIT = 100

// Listas ainda sem scroll infinito no app usam um padrão alto para não cortar conteúdo
export const DEFAULT_LIMIT = 50
export const FEED_LIMIT = 10

const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional()
})

export type Pagination = {skip: number, take: number}

export function getPagination(req: Request, defaultLimit = DEFAULT_LIMIT): Pagination {
    const result = paginationSchema.safeParse(req.query)
    if(!result.success) throw new BadRequestError('Paginação inválida')

    const take = result.data.limit ?? defaultLimit
    return {skip: (result.data.page - 1) * take, take}
}
