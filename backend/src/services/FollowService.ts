import { AppDataSource } from "../config/data-source";
import { Follow } from "../models/Follow";
import { User } from "../models/User";
import { sanitizeUser } from "../utils/sanitizeUser";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { Pagination } from "../utils/pagination";

export class FollowService {
    private repo = AppDataSource.getRepository(Follow)
    private userRepo = AppDataSource.getRepository(User)

    // Segue ou deixa de seguir um usuário (toggle)
    async toggle(targetId: number, userId: number) {
        if(targetId === userId) throw new BadRequestError('Você não pode seguir a si mesmo')

        const target = await this.userRepo.findOneBy({id: targetId})
        if(!target) throw new NotFoundError('Usuário não encontrado')

        const existing = await this.repo.findOne({
            where: {follower: {id: userId}, following: {id: targetId}}
        })

        if(existing) {
            await this.repo.delete(existing.id)
            return {following: false}
        }

        const follow = this.repo.create({follower: {id: userId}, following: {id: targetId}})
        await this.repo.save(follow)
        return {following: true}
    }

    // Quem segue o usuário
    async listFollowers(userId: number, {skip, take}: Pagination) {
        const follows = await this.repo.find({
            where: {following: {id: userId}},
            relations: {follower: true},
            order: {createdAt: 'DESC'},
            skip,
            take
        })
        return follows.map(f => sanitizeUser(f.follower))
    }

    // Quem o usuário segue
    async listFollowing(userId: number, {skip, take}: Pagination) {
        const follows = await this.repo.find({
            where: {follower: {id: userId}},
            relations: {following: true},
            order: {createdAt: 'DESC'},
            skip,
            take
        })
        return follows.map(f => sanitizeUser(f.following))
    }
}
