import { AppDataSource } from "../config/data-source";
import { NotFoundError } from "../errors";
import { Post } from "../models/Post";
import { Repost } from "../models/Repost";
import { NotificationService } from "./NotificationService";

export class RepostService {
    private repo = AppDataSource.getRepository(Repost)
    private postRepo = AppDataSource.getRepository(Post)
    private notifications = new NotificationService()

    // Reposta ou desfaz o repost (toggle)
    async toggle(postId: number, userId: number) {
        const post = await this.postRepo.findOne({where: {id: postId}, relations: {user: true}})
        if(!post) throw new NotFoundError('Post não encontrado')

        const existing = await this.repo.findOne({where: {post: {id: postId}, user: {id: userId}}})
        const notification = {type: 'repost' as const, recipientId: post.user.id, actorId: userId, postId}

        if(existing) {
            await this.repo.delete(existing.id)
            await this.notifications.remove(notification)
            return {reposted: false}
        }

        await this.repo.save(this.repo.create({post: {id: postId}, user: {id: userId}}))
        await this.notifications.notify(notification)
        return {reposted: true}
    }
}
