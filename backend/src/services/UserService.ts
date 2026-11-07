import bcrypt from 'bcrypt'
import { AppDataSource } from "../config/data-source";
import { UpdateUserDTO } from "../dtos/user";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import { PostMapper } from "../mappers/PostMapper";
import { UserMapper } from "../mappers/UserMapper";
import { Follow } from "../models/Follow";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { DEFAULT_LIMIT } from "../utils/pagination";
import { postCounts } from "../utils/relationCounts";

export class UserService {
    private repo = AppDataSource.getRepository(User)
    private postRepo = AppDataSource.getRepository(Post)
    private followRepo = AppDataSource.getRepository(Follow)

    private async findOrFail(id: number) {
        const user = await this.repo.findOneBy({id})
        if(!user) throw new NotFoundError('Usuário não encontrado')
        return user
    }

    async getProfile(id: number) {
        const user = await this.findOrFail(id)
        return {...UserMapper.toPublic(user), ...await this.profileStats(id)}
    }

    async getOwnProfile(id: number) {
        const user = await this.findOrFail(id)
        return {...UserMapper.toPrivate(user), ...await this.profileStats(id)}
    }

    private async profileStats(id: number) {
        const posts = await this.postRepo.createQueryBuilder('post')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
            .where('post.userId = :id', {id})
            .orderBy('post.createdAt', 'DESC')
            .take(DEFAULT_LIMIT)
            .getMany()

        const [postsCount, followersCount, followingCount, counts] = await Promise.all([
            this.postRepo.countBy({user: {id}}),
            this.followRepo.countBy({following: {id}}),
            this.followRepo.countBy({follower: {id}}),
            postCounts(posts.map(p => p.id))
        ])

        return {
            postsCount,
            followersCount,
            followingCount,
            posts: posts.map(post => PostMapper.toSummary(post, {
                likesCount: counts.likesCount(post.id),
                commentsCount: counts.commentsCount(post.id)
            }))
        }
    }

    async update(id: number, data: UpdateUserDTO) {
        const user = await this.findOrFail(id)

        if(data.handle && data.handle !== user.handle) {
            const handleExists = await this.repo.findOneBy({handle: data.handle})
            if(handleExists) throw new ConflictError('@usuário já está em uso')
        }

        const allowed: Partial<User> = {}
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
        return UserMapper.toPrivate(saved)
    }

    async delete(id: number) {
        await this.findOrFail(id)

        await this.repo.delete(id)
        return {message: 'Conta excluída com sucesso!'}
    }
}
