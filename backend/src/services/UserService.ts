import bcrypt from 'bcrypt'
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Follow } from "../models/Follow";
import { sanitizeUser } from "../utils/sanitizeUser";

export class UserService {
    private repo = AppDataSource.getRepository(User)
    private postRepo = AppDataSource.getRepository(Post)
    private followRepo = AppDataSource.getRepository(Follow)

    async getProfile(id: number) {
        const user = await this.repo.findOneBy({id})
        if(!user) throw new Error('Usuário não encontrado')

        const posts = await this.postRepo.createQueryBuilder('post')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
            .loadRelationIdAndMap('post.likeIds', 'post.likes')
            .loadRelationIdAndMap('post.commentIds', 'post.comments')
            .where('post.userId = :id', {id})
            .orderBy('post.createdAt', 'DESC')
            .getMany()

        const postsCount = posts.length
        const followersCount = await this.followRepo.countBy({following: {id}})
        const followingCount = await this.followRepo.countBy({follower: {id}})

        return {
            ...sanitizeUser(user),
            postsCount,
            followersCount,
            followingCount,
            posts: posts.map((p: any) => ({
                id: p.id,
                description: p.description,
                images: p.images,
                createdAt: p.createdAt,
                likesCount: p.likeIds ? p.likeIds.length : 0,
                commentsCount: p.commentIds ? p.commentIds.length : 0
            }))
        }
    }

    async update(id: number, data: any) {
        const user = await this.repo.findOneBy({id})
        if(!user) throw new Error('Usuário não encontrado')

        if(data.handle && data.handle !== user.handle) {
            const handleExists = await this.repo.findOneBy({handle: data.handle})
            if(handleExists) throw new Error('@usuário já está em uso')
        }

        const allowed: any = {}
        if(data.name !== undefined) allowed.name = data.name
        if(data.handle !== undefined) allowed.handle = data.handle
        if(data.bio !== undefined) allowed.bio = data.bio
        if(data.goal !== undefined) allowed.goal = data.goal
        if(data.password) allowed.password = await bcrypt.hash(data.password, 10)

        this.repo.merge(user, allowed)
        const saved = await this.repo.save(user)
        return sanitizeUser(saved)
    }

    async delete(id: number) {
        const user = await this.repo.findOneBy({id})
        if(!user) throw new Error('Usuário não encontrado')

        await this.repo.delete(id)
        return {message: 'Conta excluída com sucesso!'}
    }
}
