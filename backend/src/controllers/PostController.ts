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
}