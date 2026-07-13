import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Post } from "../models/Post";

export async function checkPostOwnerMiddleware(req:Request, res:Response, next: NextFunction) {
    const postId = Number(req.params.id)
    const postRepo = AppDataSource.getRepository(Post)

    const post = await postRepo.findOne({
        where: {id: postId},
        relations: {user: true}
    })

    if(!post) {
        return res.status(404).json({message: 'Post não encontrado'})
    }

    if(!req.user) {
        return res.status(401).json({message: 'Não autenticado'})
    }
    if(post.user.id !== req.user.id) {
        return res.status(403).json({message: 'Você não tem permissão para alterar esse post.'})
    }

    req.post = post
    return next()
}
