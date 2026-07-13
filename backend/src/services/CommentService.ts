import { AppDataSource } from "../config/data-source";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { sanitizeUser } from "../utils/sanitizeUser";

export class CommentService {
    private repo = AppDataSource.getRepository(Comment)
    private postRepo = AppDataSource.getRepository(Post)
    private userRepo = AppDataSource.getRepository(User)

    async create(text: string, postId: number, userId: number) {
        const post = await this.postRepo.findOneBy({id: postId})
        if(!post) throw new Error('Post não encontrado')

        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new Error('Usuário não encontrado')

        const comment = this.repo.create({text, post, user})
        const saved = await this.repo.save(comment)

        return {...saved, post: undefined, user: sanitizeUser(user)}
    }

    async listByPost(postId: number) {
        const comments = await this.repo.find({
            where: {post: {id: postId}},
            relations: {user: true, likes: true},
            order: {createdAt: 'DESC'}
        })

        return comments.map(c => ({
            id: c.id,
            text: c.text,
            createdAt: c.createdAt,
            user: sanitizeUser(c.user),
            likesCount: c.likes ? c.likes.length : 0
        }))
    }

    async delete(commentId: number, userId: number) {
        const comment = await this.repo.findOne({
            where: {id: commentId},
            relations: {user: true}
        })
        if(!comment) throw new Error('Comentário não encontrado')
        if(comment.user.id !== userId) throw new Error('Você não tem permissão para excluir esse comentário')

        await this.repo.delete(commentId)
        return {message: 'Comentário deletado com sucesso!'}
    }
}
