import { Request } from "express";
import { PaginationDTO } from "../dtos/common";
import { BadRequestError } from "../errors";

// Listas ainda sem scroll infinito no app usam um padrão alto para não cortar conteúdo
export const DEFAULT_LIMIT = 50
export const FEED_LIMIT = 10

export type Pagination = {skip: number, take: number}

export function getPagination(req: Request, defaultLimit = DEFAULT_LIMIT): Pagination {
    const result = PaginationDTO.safeParse(req.query)
    if(!result.success) throw new BadRequestError('Paginação inválida')

    const take = result.data.limit ?? defaultLimit
    return {skip: (result.data.page - 1) * take, take}
}
