import { AppDataSource } from "../config/data-source";
import { NotFoundError } from "../errors";
import { Post } from "../models/Post";
import { SavedPost } from "../models/SavedPost";
import { Pagination } from "../utils/pagination";
import { PostService } from "./PostService";

export class SavedPostService {
    private repo = AppDataSource.getRepository(SavedPost)
    private postRepo = AppDataSource.getRepository(Post)
    private posts = new PostService()

    // Salva ou remove um post dos salvos (toggle)
    async toggle(postId: number, userId: number) {
        const post = await this.postRepo.findOneBy({id: postId})
        if(!post) throw new NotFoundError('Post não encontrado')

        const existing = await this.repo.findOne({
            where: {post: {id: postId}, user: {id: userId}}
        })

        if(existing) {
            await this.repo.delete(existing.id)
            return {saved: false}
        }

        await this.repo.save(this.repo.create({post: {id: postId}, user: {id: userId}}))
        return {saved: true}
    }

    async listByUser(userId: number, {skip, take}: Pagination) {
        const saved = await this.repo.createQueryBuilder('saved')
            .leftJoinAndSelect('saved.post', 'post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
            .where('saved.userId = :userId', {userId})
            .orderBy('saved.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        const responses = await this.posts.toResponses(saved.map(s => s.post), userId)

        return responses.map((post, index) => ({...post, savedAt: saved[index].createdAt}))
    }
}
