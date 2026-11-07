import { ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Comment } from "../models/Comment";
import { CommentLike } from "../models/CommentLike";
import { Like } from "../models/Like";

// Conta as linhas relacionadas a cada id em uma única consulta
async function countBy(repo: Repository<ObjectLiteral>, column: string, ids: number[]) {
    const counts = new Map<number, number>()
    if(ids.length === 0) return counts

    const rows = await repo.createQueryBuilder('row')
        .select(`row.${column}`, 'id')
        .addSelect('COUNT(*)', 'total')
        .where(`row.${column} IN (:...ids)`, {ids})
        .groupBy(`row.${column}`)
        .getRawMany()

    rows.forEach(row => counts.set(Number(row.id), Number(row.total)))
    return counts
}

export async function postCounts(postIds: number[]) {
    const [likes, comments] = await Promise.all([
        countBy(AppDataSource.getRepository(Like), 'postId', postIds),
        countBy(AppDataSource.getRepository(Comment), 'postId', postIds)
    ])

    return {
        likesCount: (id: number) => likes.get(id) ?? 0,
        commentsCount: (id: number) => comments.get(id) ?? 0
    }
}

export function commentLikeCounts(commentIds: number[]) {
    return countBy(AppDataSource.getRepository(CommentLike), 'commentId', commentIds)
}
