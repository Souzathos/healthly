import { AppDataSource } from "../config/data-source";
import { Like } from "../models/Like";
import { CommentLike } from "../models/CommentLike";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";

export class LikeService {
    private likeRepo = AppDataSource.getRepository(Like)
    private commentLikeRepo = AppDataSource.getRepository(CommentLike)
    private postRepo = AppDataSource.getRepository(Post)
    private commentRepo = AppDataSource.getRepository(Comment)

    // Curte ou descurte um post (toggle)
    async togglePost(postId: number, userId: number) {
        const post = await this.postRepo.findOneBy({id: postId})
        if(!post) throw new Error('Post não encontrado')

        const existing = await this.likeRepo.findOne({
            where: {post: {id: postId}, user: {id: userId}}
        })

        if(existing) {
            await this.likeRepo.delete(existing.id)
            return {liked: false}
        }

        const like = this.likeRepo.create({post: {id: postId}, user: {id: userId}})
        await this.likeRepo.save(like)
        return {liked: true}
    }

    // Curte ou descurte um comentário (toggle)
    async toggleComment(commentId: number, userId: number) {
        const comment = await this.commentRepo.findOneBy({id: commentId})
        if(!comment) throw new Error('Comentário não encontrado')

        const existing = await this.commentLikeRepo.findOne({
            where: {comment: {id: commentId}, user: {id: userId}}
        })

        if(existing) {
            await this.commentLikeRepo.delete(existing.id)
            return {liked: false}
        }

        const like = this.commentLikeRepo.create({comment: {id: commentId}, user: {id: userId}})
        await this.commentLikeRepo.save(like)
        return {liked: true}
    }
}
