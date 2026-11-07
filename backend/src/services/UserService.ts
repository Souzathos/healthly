import bcrypt from 'bcrypt'
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Follow } from "../models/Follow";
import { DEFAULT_LIMIT } from "../utils/pagination";
import { postCounts } from "../utils/relationCounts";
import { sanitizeOwnUser, sanitizeUser } from "../utils/sanitizeUser";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors";

export class UserService {
    private repo = AppDataSource.getRepository(User)
    private postRepo = AppDataSource.getRepository(Post)
    private followRepo = AppDataSource.getRepository(Follow)

    async getProfile(id: number) {
        const user = await this.repo.findOneBy({id})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        return {...sanitizeUser(user), ...await this.profileStats(id)}
    }

    async getOwnProfile(id: number) {
        const user = await this.repo.findOneBy({id})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        return {...sanitizeOwnUser(user), ...await this.profileStats(id)}
    }

    private async profileStats(id: number) {
        const posts = await this.postRepo.createQueryBuilder('post')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
            .where('post.userId = :id', {id})
            .orderBy('post.createdAt', 'DESC')
            .take(DEFAULT_LIMIT)
            .getMany()

        const postsCount = await this.postRepo.countBy({user: {id}})
        const counts = await postCounts(posts.map(p => p.id))
        const followersCount = await this.followRepo.countBy({following: {id}})
        const followingCount = await this.followRepo.countBy({follower: {id}})

        return {
            postsCount,
            followersCount,
            followingCount,
            posts: posts.map((p: any) => ({
                id: p.id,
                description: p.description,
                images: p.images,
                createdAt: p.createdAt,
                likesCount: counts.likesCount(p.id),
                commentsCount: counts.commentsCount(p.id)
            }))
        }
    }

    async update(id: number, data: any) {
        const user = await this.repo.findOneBy({id})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        if(data.handle && data.handle !== user.handle) {
            const handleExists = await this.repo.findOneBy({handle: data.handle})
            if(handleExists) throw new ConflictError('@usuário já está em uso')
        }

        const allowed: any = {}
        if(data.name !== undefined) allowed.name = data.name
        if(data.handle !== undefined) allowed.handle = data.handle
        if(data.bio !== undefined) allowed.bio = data.bio
        if(data.goal !== undefined) allowed.goal = data.goal
        if(data.password) {
            const validCurrent = await bcrypt.compare(data.currentPassword ?? '', user.password)
            if(!validCurrent) throw new BadRequestError('Senha atual incorreta')

            allowed.password = await bcrypt.hash(data.password, 10)
        }

        this.repo.merge(user, allowed)
        const saved = await this.repo.save(user)
        return sanitizeOwnUser(saved)
    }

    async delete(id: number) {
        const user = await this.repo.findOneBy({id})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        await this.repo.delete(id)
        return {message: 'Conta excluída com sucesso!'}
    }
}
