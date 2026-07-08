import { AppDataSource } from "../config/data-source";
import { Post } from "../models/Post";
import { PostMedia } from "../models/PostMedia";
import { User } from "../models/User";

export class PostService {
    private repo = AppDataSource.getRepository(Post)
    private userRepo = AppDataSource.getRepository(User)
    private imageRepo = AppDataSource.getRepository(PostMedia)

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
        const {password, cpf, ...safeUser} = savedPost.user
        return {...savedPost, user: safeUser}
    }
    
    async update(data: any, userId: number, files?: Express.Multer.File[]) {
        const user = await this.userRepo.findOneBy({id: userId})
        if(!user) throw new Error("Usuário não encontrado")
        const post = await this.repo.findOneBy({id: data.id})
        if(!post) throw new Error('Post não encontrado')

        if(files && files.length > 0) {
            const images = files.map((file, index) => 
                this.imageRepo.update(post.images, {
                    data: file.buffer,
                    mimeType: file.mimetype,
                    position: index,
                    post: post
                })
                )
                await this.imageRepo.save(images)
        }
        const newPost = await this.repo.update(post, {...post, description: data.description})
        this.repo.save(newPost)
        return newPost
    }

}