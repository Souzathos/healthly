import { AppDataSource } from "../config/data-source";
import { Post } from "../models/Post";
import { PostMedia } from "../models/PostMedia";
import { User } from "../models/User";
import { Follow } from "../models/Follow";
import { sanitizeUser } from "../utils/sanitizeUser";

const PAGE_SIZE = 10

export class PostService {
    private repo = AppDataSource.getRepository(Post)
    private userRepo = AppDataSource.getRepository(User)
    private imageRepo = AppDataSource.getRepository(PostMedia)
    private followRepo = AppDataSource.getRepository(Follow)

    // Monta a query base de leitura: autor + mídias (só metadados, sem o blob) + ids p/ contagem
    private baseQuery() {
        return this.repo.createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
            .loadRelationIdAndMap('post.likeIds', 'post.likes')
            .loadRelationIdAndMap('post.commentIds', 'post.comments')
    }

    private format(post: any) {
        return {
            id: post.id,
            description: post.description,
            images: post.images,
            createdAt: post.createdAt,
            user: post.user ? sanitizeUser(post.user) : null,
            likesCount: post.likeIds ? post.likeIds.length : 0,
            commentsCount: post.commentIds ? post.commentIds.length : 0
        }
    }

    async create(data: any, userId: number, files?:Express.Multer.File[]) {
        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new Error('Usuário não encontrado')

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
        if(!post) throw new Error('Post não encontrado')

        await this.repo.delete(id)

        return {message: 'Post deletado com sucesso!'}
    }

    // Feed: posts dos usuários seguidos + os próprios, mais recentes primeiro
    async getFeed(userId: number, page: number = 1) {
        const follows = await this.followRepo.find({
            where: {follower: {id: userId}},
            relations: {following: true}
        })
        const ids = follows.map(f => f.following.id)
        ids.push(userId)

        const posts = await this.baseQuery()
            .where('post.userId IN (:...ids)', {ids})
            .orderBy('post.createdAt', 'DESC')
            .skip((page - 1) * PAGE_SIZE)
            .take(PAGE_SIZE)
            .getMany()

        return posts.map((p: any) => this.format(p))
    }

    async getById(id: number) {
        const post = await this.baseQuery()
            .where('post.id = :id', {id})
            .getOne()

        if(!post) throw new Error('Post não encontrado')
        return this.format(post)
    }

    async getByUser(userId: number) {
        const posts = await this.baseQuery()
            .where('post.userId = :userId', {userId})
            .orderBy('post.createdAt', 'DESC')
            .getMany()

        return posts.map((p: any) => this.format(p))
    }

    // Retorna o binário de uma mídia para ser servido por uma rota GET
    async getMedia(mediaId: number) {
        const media = await this.imageRepo.findOneBy({id: mediaId})
        if(!media) throw new Error('Mídia não encontrada')
        return media
    }
}
