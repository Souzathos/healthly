import { AppDataSource } from "../config/data-source";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { sanitizeUser } from "../utils/sanitizeUser";
import { ForbiddenError, NotFoundError } from "../utils/errors";
import { Pagination } from "../utils/pagination";
import { commentLikeCounts } from "../utils/relationCounts";

export class CommentService {
    private repo = AppDataSource.getRepository(Comment)
    private postRepo = AppDataSource.getRepository(Post)
    private userRepo = AppDataSource.getRepository(User)

    async create(text: string, postId: number, userId: number) {
        const post = await this.postRepo.findOneBy({id: postId})
        if(!post) throw new NotFoundError('Post não encontrado')

        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        const comment = this.repo.create({text, post, user})
        const saved = await this.repo.save(comment)

        return {...saved, post: undefined, user: sanitizeUser(user)}
    }

    async listByPost(postId: number, {skip, take}: Pagination) {
        const comments = await this.repo.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('comment.postId = :postId', {postId})
            .orderBy('comment.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        const likes = await commentLikeCounts(comments.map(c => c.id))

        return comments.map(c => ({
            id: c.id,
            text: c.text,
            createdAt: c.createdAt,
            user: sanitizeUser(c.user),
            likesCount: likes.get(c.id) ?? 0
        }))
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
