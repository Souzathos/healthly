import { In } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { CreatePostDTO, SearchPostsDTO, UpdatePostDTO } from "../dtos/post";
import { BadRequestError, NotFoundError } from "../errors";
import { PostMapper } from "../mappers/PostMapper";
import { Follow } from "../models/Follow";
import { Like } from "../models/Like";
import { Post } from "../models/Post";
import { PostMedia } from "../models/PostMedia";
import { SavedPost } from "../models/SavedPost";
import { User } from "../models/User";
import { Pagination } from "../utils/pagination";
import { postCounts } from "../utils/relationCounts";
import { Hashtag } from "../models/Hashtag";
import { Repost } from "../models/Repost";
import { EntityManager } from "typeorm";
import { extractHashtags } from "../utils/hashtags";

export class PostService {
    private repo = AppDataSource.getRepository(Post)
    private userRepo = AppDataSource.getRepository(User)
    private imageRepo = AppDataSource.getRepository(PostMedia)
    private followRepo = AppDataSource.getRepository(Follow)
    private likeRepo = AppDataSource.getRepository(Like)
    private savedRepo = AppDataSource.getRepository(SavedPost)
    private repostRepo = AppDataSource.getRepository(Repost)

    // Query base de leitura: autor + mídias (só metadados, sem o blob)
    private baseQuery() {
        return this.repo.createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoin('post.images', 'image')
            .addSelect(['image.id', 'image.position', 'image.mimeType'])
    }

    private async viewerSets(postIds: number[], viewerId?: number) {
        if(!viewerId || postIds.length === 0) {
            return {liked: new Set<number>(), saved: new Set<number>(), reposted: new Set<number>()}
        }

        const where = {user: {id: viewerId}, post: {id: In(postIds)}}
        const [likes, saved, reposts] = await Promise.all([
            this.likeRepo.find({where, relations: {post: true}}),
            this.savedRepo.find({where, relations: {post: true}}),
            this.repostRepo.find({where, relations: {post: true}})
        ])

        return {
            liked: new Set(likes.map(l => l.post.id)),
            saved: new Set(saved.map(s => s.post.id)),
            reposted: new Set(reposts.map(r => r.post.id))
        }
    }

    // Monta a resposta de vários posts com contagens e o estado de quem está vendo
    async toResponses(posts: Post[], viewerId?: number) {
        const ids = posts.map(p => p.id)
        const [{liked, saved, reposted}, counts] = await Promise.all([
            this.viewerSets(ids, viewerId),
            postCounts(ids)
        ])

        return posts.map(post => PostMapper.toResponse(post, {
            likesCount: counts.likesCount(post.id),
            commentsCount: counts.commentsCount(post.id),
            repostsCount: counts.repostsCount(post.id),
            likedByMe: liked.has(post.id),
            savedByMe: saved.has(post.id),
            repostedByMe: reposted.has(post.id)
        }))
    }

    private buildImages(files: Express.Multer.File[], post: Post) {
        return files.map((file, index) => this.imageRepo.create({
            data: file.buffer,
            mimeType: file.mimetype,
            position: index,
            post
        }))
    }

    // Cria as hashtags que ainda não existem e devolve todas as do texto
    private async resolveHashtags(manager: EntityManager, description?: string | null) {
        const names = extractHashtags(description)
        if(names.length === 0) return []

        await manager.createQueryBuilder()
            .insert()
            .into(Hashtag)
            .values(names.map(name => ({name})))
            .orIgnore()
            // As que já existiam não geram id no MySQL: os ids vêm do find logo abaixo
            .updateEntity(false)
            .execute()

        return manager.find(Hashtag, {where: names.map(name => ({name}))})
    }

    async create(data: CreatePostDTO, userId: number, files: Express.Multer.File[] = []) {
        if(!data.description?.trim() && files.length === 0) {
            throw new BadRequestError('O post precisa de texto ou imagem')
        }

        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new NotFoundError('Usuário não encontrado')

        // Post e imagens entram juntos: se uma imagem falhar, o post não fica pela metade
        const postId = await AppDataSource.transaction(async manager => {
            const hashtags = await this.resolveHashtags(manager, data.description)
            const post = await manager.save(this.repo.create({
                description: data.description,
                diet: data.diet ?? null,
                hashtags,
                user
            }))
            if(files.length > 0) await manager.save(this.buildImages(files, post))
            return post.id
        })

        return this.getById(postId, userId)
    }

    async update(data: UpdatePostDTO, post: Post, files: Express.Multer.File[] = []) {
        if(data.description === undefined && data.diet === undefined && files.length === 0) {
            throw new BadRequestError('Envie um texto ou novas imagens')
        }

        await AppDataSource.transaction(async manager => {
            if(files.length > 0) {
                await manager.delete(PostMedia, {post: {id: post.id}})
                await manager.save(this.buildImages(files, post))
            }
            if(data.description !== undefined) {
                // save, e não update, para a tabela de hashtags do post ser refeita
                post.description = data.description
                post.hashtags = await this.resolveHashtags(manager, data.description)
                await manager.save(Post, post)
            }
            if(data.diet !== undefined) {
                await manager.update(Post, {id: post.id}, {diet: data.diet})
            }
        })

        return this.getById(post.id, post.user.id)
    }

    async delete(id: number) {
        const post = await this.repo.findOneBy({id})
        if(!post) throw new NotFoundError('Post não encontrado')

        await this.repo.delete(id)

        return {message: 'Post deletado com sucesso!'}
    }

    // Feed: posts e reposts de quem a pessoa segue, mais os próprios, mais recentes primeiro
    async getFeed(userId: number, {skip, take}: Pagination) {
        const follows = await this.followRepo.find({
            where: {follower: {id: userId}},
            relations: {following: true}
        })
        const ids = follows.map(f => f.following.id)
        ids.push(userId)

        const posts = await this.baseQuery()
            .where('post.userId IN (:...ids)', {ids})
            .orWhere('post.id IN (SELECT repost.postId FROM reposts repost WHERE repost.userId IN (:...ids))', {ids})
            .orderBy('post.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.toResponses(posts, userId)
    }

    // Para você (RF17): posts de todo mundo ordenados por relevância.
    // Interação soma pontos e cada 12 horas de idade tira 1 ponto, para o feed não ficar parado.
    async getExplore({skip, take}: Pagination, viewerId?: number) {
        const ranked = await this.repo.createQueryBuilder('post')
            .select('post.id', 'id')
            .addSelect(`(
                (SELECT COUNT(*) FROM likes l WHERE l.postId = post.id) * 2
                + (SELECT COUNT(*) FROM comments c WHERE c.postId = post.id) * 3
                + (SELECT COUNT(*) FROM reposts r WHERE r.postId = post.id) * 2
                - TIMESTAMPDIFF(HOUR, post.createdAt, NOW()) / 12
            )`, 'score')
            .orderBy('score', 'DESC')
            .addOrderBy('post.createdAt', 'DESC')
            .addOrderBy('post.id', 'DESC')
            .offset(skip)
            .limit(take)
            .getRawMany()

        const ids = ranked.map(row => Number(row.id))
        if(ids.length === 0) return []

        // Carrega os posts completos e devolve na ordem da pontuação
        const posts = await this.baseQuery().where('post.id IN (:...ids)', {ids}).getMany()
        const position = new Map(ids.map((id, index) => [id, index]))
        posts.sort((a, b) => position.get(a.id)! - position.get(b.id)!)

        return this.toResponses(posts, viewerId)
    }

    // Busca por texto e/ou dieta, mais recentes primeiro (RF08, RF18)
    async search({q, diet}: SearchPostsDTO, {skip, take}: Pagination, viewerId?: number) {
        const query = this.baseQuery()

        if(q) {
            const term = `%${q.replace(/[\\%_]/g, char => `\\${char}`)}%`
            query.andWhere('post.description LIKE :term', {term})
        }
        if(diet) query.andWhere('post.diet = :diet', {diet})

        const posts = await query
            .orderBy('post.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.toResponses(posts, viewerId)
    }

    // Posts de uma hashtag (RF19)
    async getByHashtag(tag: string, {skip, take}: Pagination, viewerId?: number) {
        const name = tag.replace(/^#/, '').toLowerCase()

        const posts = await this.baseQuery()
            .innerJoin('post.hashtags', 'hashtag', 'hashtag.name = :name', {name})
            .orderBy('post.createdAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.toResponses(posts, viewerId)
    }

    // Hashtags com mais posts nos últimos 7 dias
    async trendingHashtags(limit = 10) {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const rows = await AppDataSource.getRepository(Hashtag).createQueryBuilder('hashtag')
            .innerJoin('hashtag.posts', 'post', 'post.createdAt >= :since', {since})
            .select('hashtag.name', 'name')
            .addSelect('COUNT(post.id)', 'postsCount')
            .groupBy('hashtag.id')
            .orderBy('postsCount', 'DESC')
            .addOrderBy('hashtag.name', 'ASC')
            .limit(limit)
            .getRawMany()

        return rows.map(row => ({name: row.name, postsCount: Number(row.postsCount)}))
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
