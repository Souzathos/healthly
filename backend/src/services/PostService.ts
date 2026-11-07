import { AppDataSource } from "../config/data-source";
import { Post } from "../models/Post";
import { PostMedia } from "../models/PostMedia";
import { User } from "../models/User";
import { Follow } from "../models/Follow";
import { Like } from "../models/Like";
import { SavedPost } from "../models/SavedPost";
import { In } from "typeorm";
import { sanitizeUser } from "../utils/sanitizeUser";
import { NotFoundError } from "../utils/errors";
import { Pagination } from "../utils/pagination";
import { postCounts } from "../utils/relationCounts";

export class PostService {
    private repo = AppDataSource.getRepository(Post)
    private userRepo = AppDataSource.getRepository(User)
    private imageRepo = AppDataSource.getRepository(PostMedia)
    private followRepo = AppDataSource.getRepository(Follow)
    private likeRepo = AppDataSource.getRepository(Like)
    private savedRepo = AppDataSource.getRepository(SavedPost)

    // Monta a query base de leitura: autor + mídias (só metadados, sem o blob) + ids p/ contagem
    private baseQuery() {
        return this.repo.createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
    }

    private async viewerSets(posts: any[], viewerId?: number) {
        const empty = {liked: new Set<number>(), saved: new Set<number>()}
        if(!viewerId || posts.length === 0) return empty

        const postIds = posts.map(p => p.id)

        const likes = await this.likeRepo.find({
            where: {user: {id: viewerId}, post: {id: In(postIds)}},
            relations: {post: true}
        })
        const saved = await this.savedRepo.find({
            where: {user: {id: viewerId}, post: {id: In(postIds)}},
            relations: {post: true}
        })

        return {
            liked: new Set(likes.map(l => l.post.id)),
            saved: new Set(saved.map(s => s.post.id))
        }
    }

    private async formatAll(posts: any[], viewerId?: number) {
        const {liked, saved} = await this.viewerSets(posts, viewerId)
        const counts = await postCounts(posts.map(p => p.id))

        return posts.map(post => ({
            id: post.id,
            description: post.description,
            images: post.images,
            createdAt: post.createdAt,
            user: post.user ? sanitizeUser(post.user) : null,
            likesCount: counts.likesCount(post.id),
            commentsCount: counts.commentsCount(post.id),
            likedByMe: liked.has(post.id),
            savedByMe: saved.has(post.id)
        }))
    }

    async create(data: any, userId: number, files?:Express.Multer.File[]) {
        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        const post = this.repo.create({
            description: data.description,
            user
        })

        const savedPost = await this.repo.save(post)

        if (files && files.length > 0) {
            const images = files.map((file, index) =>
                this.imageRepo.create({
                    data: file.buffer,
                    mimeType: file.mimetype,
                    position: index,
                    post: savedPost
                })
            )
            await this.imageRepo.save(images)
        }
        return {...savedPost, user: sanitizeUser(savedPost.user)}
    }

    async update(data: any, post:Post, files?: Express.Multer.File[]) {
        if(files && files.length > 0) {
            await this.imageRepo.delete({post: {id: post.id}})

            const images = files.map((file, index) =>
            this.imageRepo.create({
                data: file.buffer,
                mimeType: file.mimetype,
                position: index,
                post
            }))
            await this.imageRepo.save(images)
        }

        await this.repo.update({id: post.id}, {description: data.description})

        return this.getById(post.id)
    }

    async delete(id: number) {
        const post = await this.repo.findOneBy({id})
        if(!post) throw new NotFoundError('Post não encontrado')

        await this.repo.delete(id)

        return {message: 'Post deletado com sucesso!'}
    }

    // Feed: posts dos usuários seguidos + os próprios, mais recentes primeiro
    async getFeed(userId: number, {skip, take}: Pagination) {
        const follows = await this.followRepo.find({
            where: {follower: {id: userId}},
            relations: {following: true}
        })
        const ids = follows.map(f => f.following.id)
        ids.push(userId)

        const posts = await this.baseQuery()
            .where('post.userId IN (:...ids)', {ids})
            .orderBy('post.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.formatAll(posts, userId)
    }

    async getById(id: number, viewerId?: number) {
        const post = await this.baseQuery()
            .where('post.id = :id', {id})
            .getOne()

        if(!post) throw new NotFoundError('Post não encontrado')

        const [formatted] = await this.formatAll([post], viewerId)
        return formatted
    }

    async getByUser(userId: number, {skip, take}: Pagination, viewerId?: number) {
        const posts = await this.baseQuery()
            .where('post.userId = :userId', {userId})
            .orderBy('post.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.formatAll(posts, viewerId)
    }

    async getLikedByUser(userId: number, {skip, take}: Pagination) {
        const posts = await this.baseQuery()
            // Com skip/take, a coluna usada no orderBy precisa estar selecionada
            .innerJoinAndSelect('post.likes', 'likeFilter', 'likeFilter.userId = :userId', {userId})
            .orderBy('likeFilter.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.formatAll(posts, userId)
    }

    async getMedia(mediaId: number) {
        const media = await this.imageRepo.findOneBy({id: mediaId})
        if(!media) throw new NotFoundError('Mídia não encontrada')
        return media
    }
}
