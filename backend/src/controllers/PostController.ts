import { Request, Response } from "express";
import { PostService } from "../services/PostService";

export class PostController {
    private service = new PostService()

    async create(req:Request, res:Response) {
        try{
            const user = Number(req.params.id)
            const files = req.files as Express.Multer.File[]
            const {description} = req.body 
            const post = await this.service.create({description}, user, files)

            return res.status(201).json(post)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }

    }

    async update(req:Request, res:Response) {
        try {
            const files = req.files as Express.Multer.File[]
            const {description} = req.body

            const updatedPost = await this.service.update(req.post!, description , files)
            return res.status(200).json(updatedPost)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }

    async delete(req:Request, res:Response) {
        try {
            const id = Number(req.params.id)
            const post = await this.service.delete(id)

            return res.status(200).json(post)
        } catch(e: any) {
            return res.status(400).json({message: e.message})
        }
    }
}