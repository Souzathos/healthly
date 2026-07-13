import { AppDataSource } from "../config/data-source";
import { SavedPost } from "../models/SavedPost";
import { Post } from "../models/Post";
import { sanitizeUser } from "../utils/sanitizeUser";

export class SavedPostService {
    private repo = AppDataSource.getRepository(SavedPost)
    private postRepo = AppDataSource.getRepository(Post)

    // Salva ou remove um post dos salvos (toggle)
    async toggle(postId: number, userId: number) {
        const post = await this.postRepo.findOneBy({id: postId})
        if(!post) throw new Error('Post não encontrado')

        const existing = await this.repo.findOne({
            where: {post: {id: postId}, user: {id: userId}}
        })

        if(existing) {
            await this.repo.delete(existing.id)
            return {saved: false}
        }

        const saved = this.repo.create({post: {id: postId}, user: {id: userId}})
        await this.repo.save(saved)
        return {saved: true}
    }

    async listByUser(userId: number) {
        const saved = await this.repo.createQueryBuilder('saved')
            .leftJoinAndSelect('saved.post', 'post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
            .loadRelationIdAndMap('post.likeIds', 'post.likes')
            .loadRelationIdAndMap('post.commentIds', 'post.comments')
            .where('saved.userId = :userId', {userId})
            .orderBy('saved.createdAt', 'DESC')
            .getMany()

        return saved.map((s: any) => ({
            id: s.post.id,
            description: s.post.description,
            images: s.post.images,
            createdAt: s.post.createdAt,
            user: s.post.user ? sanitizeUser(s.post.user) : null,
            likesCount: s.post.likeIds ? s.post.likeIds.length : 0,
            commentsCount: s.post.commentIds ? s.post.commentIds.length : 0,
            savedAt: s.createdAt
        }))
    }
}
