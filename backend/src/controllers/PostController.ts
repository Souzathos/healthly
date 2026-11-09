import { Request, Response } from "express";
import { PostService } from "../services/PostService";
import { isAllowedImageType } from "../middlewares/upload";
import { FEED_LIMIT, getPagination } from "../utils/pagination";
import { SearchPostsDTO } from "../dtos/post";
import { RepostService } from "../services/RepostService";
import { BadRequestError } from "../errors";

export class PostController {
    private service = new PostService()
    private reposts = new RepostService()

    async repost(req: Request, res: Response) {
        return res.status(200).json(await this.reposts.toggle(Number(req.params.id), req.user!.id))
    }

    async create(req: Request, res: Response) {
        const files = req.files as Express.Multer.File[]
        const {description, diet} = req.body
        const post = await this.service.create({description, diet}, req.user!.id, files)

        return res.status(201).json(post)
    }

    async feed(req: Request, res: Response) {
        const posts = await this.service.getFeed(req.user!.id, getPagination(req, FEED_LIMIT))

        return res.status(200).json(posts)
    }

    async explore(req: Request, res: Response) {
        const posts = await this.service.getExplore(getPagination(req, FEED_LIMIT), req.user!.id)

        return res.status(200).json(posts)
    }

    async search(req: Request, res: Response) {
        const result = SearchPostsDTO.safeParse(req.query)
        if(!result.success) throw new BadRequestError(result.error.issues[0].message)

        const posts = await this.service.search(result.data, getPagination(req, FEED_LIMIT), req.user?.id)
        return res.status(200).json(posts)
    }

    async byHashtag(req: Request, res: Response) {
        const posts = await this.service.getByHashtag(String(req.params.tag), getPagination(req, FEED_LIMIT), req.user?.id)
        return res.status(200).json(posts)
    }

    async trending(_req: Request, res: Response) {
        return res.status(200).json(await this.service.trendingHashtags())
    }

    async getById(req: Request, res: Response) {
        const post = await this.service.getById(Number(req.params.id), req.user?.id)

        return res.status(200).json(post)
    }

    async getByUser(req: Request, res: Response) {
        const posts = await this.service.getByUser(Number(req.params.userId), getPagination(req), req.user?.id)

        return res.status(200).json(posts)
    }

    async likedByUser(req: Request, res: Response) {
        const posts = await this.service.getLikedByUser(req.user!.id, getPagination(req))

        return res.status(200).json(posts)
    }

    async getMedia(req: Request, res: Response) {
        const media = await this.service.getMedia(Number(req.params.mediaId))

        // Mídias antigas podem ter um tipo que o navegador executaria, como text/html
        const contentType = isAllowedImageType(media.mimeType) ? media.mimeType : 'application/octet-stream'

        res.setHeader('Content-Type', contentType)
        return res.send(media.data)
    }

    async update(req: Request, res: Response) {
        const files = req.files as Express.Multer.File[]
        const {description, diet} = req.body
        const updatedPost = await this.service.update({description, diet}, req.post!, files)

        return res.status(200).json(updatedPost)
    }

    async delete(req: Request, res: Response) {
        const result = await this.service.delete(Number(req.params.id))

        return res.status(200).json(result)
    }
}
