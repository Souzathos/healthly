import { In } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/post";
import { NotFoundError } from "../errors";
import { PostMapper } from "../mappers/PostMapper";
import { Follow } from "../models/Follow";
import { Like } from "../models/Like";
import { Post } from "../models/Post";
import { PostMedia } from "../models/PostMedia";
import { SavedPost } from "../models/SavedPost";
import { User } from "../models/User";
import { Pagination } from "../utils/pagination";
import { postCounts } from "../utils/relationCounts";

export class PostService {
    private repo = AppDataSource.getRepository(Post)
    private userRepo = AppDataSource.getRepository(User)
    private imageRepo = AppDataSource.getRepository(PostMedia)
    private followRepo = AppDataSource.getRepository(Follow)
    private likeRepo = AppDataSource.getRepository(Like)
    private savedRepo = AppDataSource.getRepository(SavedPost)

    // Query base de leitura: autor + mídias (só metadados, sem o blob)
    private baseQuery() {
        return this.repo.createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
    }

    private async viewerSets(postIds: number[], viewerId?: number) {
        if(!viewerId || postIds.length === 0) {
            return {liked: new Set<number>(), saved: new Set<number>()}
        }

        const where = {user: {id: viewerId}, post: {id: In(postIds)}}
        const [likes, saved] = await Promise.all([
            this.likeRepo.find({where, relations: {post: true}}),
            this.savedRepo.find({where, relations: {post: true}})
        ])

        return {
            liked: new Set(likes.map(l => l.post.id)),
            saved: new Set(saved.map(s => s.post.id))
        }
    }

    // Monta a resposta de vários posts com contagens e o estado de quem está vendo
    async toResponses(posts: Post[], viewerId?: number) {
        const ids = posts.map(p => p.id)
        const [{liked, saved}, counts] = await Promise.all([
            this.viewerSets(ids, viewerId),
            postCounts(ids)
        ])

        return posts.map(post => PostMapper.toResponse(post, {
            likesCount: counts.likesCount(post.id),
            commentsCount: counts.commentsCount(post.id),
            likedByMe: liked.has(post.id),
            savedByMe: saved.has(post.id)
        }))
    }

    async create(data: CreatePostDTO, userId: number, files?: Express.Multer.File[]) {
        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        const savedPost = await this.repo.save(this.repo.create({description: data.description, user}))

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

        return this.getById(savedPost.id, userId)
    }

    async update(data: UpdatePostDTO, post: Post, files?: Express.Multer.File[]) {
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

        return this.getById(post.id, post.user.id)
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

        return this.toResponses(posts, userId)
    }

    async getById(id: number, viewerId?: number) {
        const post = await this.baseQuery()
            .where('post.id = :id', {id})
            .getOne()

        if(!post) throw new NotFoundError('Post não encontrado')

        const [response] = await this.toResponses([post], viewerId)
        return response
    }

    async getByUser(userId: number, {skip, take}: Pagination, viewerId?: number) {
        const posts = await this.baseQuery()
            .where('post.userId = :userId', {userId})
            .orderBy('post.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.toResponses(posts, viewerId)
    }

    async getLikedByUser(userId: number, {skip, take}: Pagination) {
        const posts = await this.baseQuery()
            // Com skip/take, a coluna usada no orderBy precisa estar selecionada
            .innerJoinAndSelect('post.likes', 'likeFilter', 'likeFilter.userId = :userId', {userId})
            .orderBy('likeFilter.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.toResponses(posts, userId)
    }

    async getMedia(mediaId: number) {
        const media = await this.imageRepo.findOneBy({id: mediaId})
        if(!media) throw new NotFoundError('Mídia não encontrada')
        return media
    }
}
