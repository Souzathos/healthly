import { AppDataSource } from "../config/data-source";
import { ForbiddenError, NotFoundError } from "../errors";
import { CommentMapper } from "../mappers/CommentMapper";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { CommentLike } from "../models/CommentLike";
import { In } from "typeorm";
import { Pagination } from "../utils/pagination";
import { commentLikeCounts } from "../utils/relationCounts";

export class CommentService {
    private repo = AppDataSource.getRepository(Comment)
    private postRepo = AppDataSource.getRepository(Post)
    private userRepo = AppDataSource.getRepository(User)
    private likeRepo = AppDataSource.getRepository(CommentLike)

    async create(text: string, postId: number, userId: number) {
        const post = await this.postRepo.findOneBy({id: postId})
        if(!post) throw new NotFoundError('Post não encontrado')

        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        const saved = await this.repo.save(this.repo.create({text, post, user}))

        return CommentMapper.toResponse(saved, {likesCount: 0, likedByMe: false})
    }

    async listByPost(postId: number, {skip, take}: Pagination, viewerId?: number) {
        const comments = await this.repo.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('comment.postId = :postId', {postId})
            .orderBy('comment.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        const ids = comments.map(c => c.id)
        const [likes, liked] = await Promise.all([
            commentLikeCounts(ids),
            this.likedByViewer(ids, viewerId)
        ])

        return comments.map(c => CommentMapper.toResponse(c, {
            likesCount: likes.get(c.id) ?? 0,
            likedByMe: liked.has(c.id)
        }))
    }

    private async likedByViewer(commentIds: number[], viewerId?: number) {
        if(!viewerId || commentIds.length === 0) return new Set<number>()

        const likes = await this.likeRepo.find({
            where: {user: {id: viewerId}, comment: {id: In(commentIds)}},
            relations: {comment: true}
        })
        return new Set(likes.map(l => l.comment.id))
    }

    async delete(commentId: number, userId: number) {
        const comment = await this.repo.findOne({
            where: {id: commentId},
            relations: {user: true}
        })
        if(!comment) throw new NotFoundError('Comentário não encontrado')
        if(comment.user.id !== userId) throw new ForbiddenError('Você não tem permissão para excluir esse comentário')

        await this.repo.delete(commentId)
        return {message: 'Comentário deletado com sucesso!'}
    }
}
