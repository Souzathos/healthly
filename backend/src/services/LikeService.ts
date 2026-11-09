import { AppDataSource } from "../config/data-source";
import { Like } from "../models/Like";
import { CommentLike } from "../models/CommentLike";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { NotFoundError } from "../errors";
import { NotificationService } from "./NotificationService";

export class LikeService {
    private likeRepo = AppDataSource.getRepository(Like)
    private commentLikeRepo = AppDataSource.getRepository(CommentLike)
    private postRepo = AppDataSource.getRepository(Post)
    private commentRepo = AppDataSource.getRepository(Comment)
    private notifications = new NotificationService()

    // Curte ou descurte um post (toggle)
    async togglePost(postId: number, userId: number) {
        const post = await this.postRepo.findOne({where: {id: postId}, relations: {user: true}})
        if(!post) throw new NotFoundError('Post não encontrado')

        const existing = await this.likeRepo.findOne({
            where: {post: {id: postId}, user: {id: userId}}
        })
        const notification = {type: 'like' as const, recipientId: post.user.id, actorId: userId, postId}

        if(existing) {
            await this.likeRepo.delete(existing.id)
            await this.notifications.remove(notification)
            return {liked: false}
        }

        const like = this.likeRepo.create({post: {id: postId}, user: {id: userId}})
        await this.likeRepo.save(like)
        await this.notifications.notify(notification)
        return {liked: true}
    }

    // Curte ou descurte um comentário (toggle)
    async toggleComment(commentId: number, userId: number) {
        const comment = await this.commentRepo.findOneBy({id: commentId})
        if(!comment) throw new NotFoundError('Comentário não encontrado')

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
