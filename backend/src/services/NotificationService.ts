import { IsNull } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { NotFoundError } from "../errors";
import { NotificationMapper } from "../mappers/NotificationMapper";
import { Notification, NotificationType } from "../models/Notification";
import { emitToUser } from "../realtime/socket";
import { Pagination } from "../utils/pagination";

type NotifyInput = {
    type: NotificationType
    recipientId: number
    actorId: number
    postId?: number
    commentId?: number
}

export class NotificationService {
    private repo = AppDataSource.getRepository(Notification)

    // Salva e avisa ao vivo. Uma falha aqui não pode desfazer a curtida, o comentário ou o follow.
    async notify({type, recipientId, actorId, postId, commentId}: NotifyInput) {
        if(recipientId === actorId) return

        try {
            const saved = await this.repo.save(this.repo.create({
                type,
                recipient: {id: recipientId},
                actor: {id: actorId},
                post: postId ? {id: postId} : null,
                comment: commentId ? {id: commentId} : null
            }))

            const notification = await this.findWithRelations(saved.id)
            if(notification) {
                emitToUser(recipientId, 'notification:new', NotificationMapper.toResponse(notification))
            }
        } catch(error) {
            console.error('Falha ao criar notificação:', error)
        }
    }

    // Descurtir ou deixar de seguir apaga o aviso correspondente
    async remove({type, recipientId, actorId, postId}: Omit<NotifyInput, 'commentId'>) {
        try {
            const result = await this.repo.delete({
                type,
                recipient: {id: recipientId},
                actor: {id: actorId},
                ...(postId ? {post: {id: postId}} : {})
            })
            // O app de quem recebeu atualiza o contador e a lista
            if(result.affected) emitToUser(recipientId, 'notification:removed', {})
        } catch(error) {
            console.error('Falha ao remover notificação:', error)
        }
    }

    async list(userId: number, {skip, take}: Pagination) {
        const notifications = await this.repo.find({
            where: {recipient: {id: userId}},
            relations: {actor: true, post: true, comment: true},
            order: {createdAt: 'DESC', id: 'DESC'},
            skip,
            take
        })
        return notifications.map(NotificationMapper.toResponse)
    }

    async unreadCount(userId: number) {
        const count = await this.repo.countBy({recipient: {id: userId}, readAt: IsNull()})
        return {count}
    }

    async markRead(id: number, userId: number) {
        const result = await this.repo.update(
            {id, recipient: {id: userId}},
            {readAt: new Date()}
        )
        if(!result.affected) throw new NotFoundError('Notificação não encontrada')
        return {read: true}
    }

    async markAllRead(userId: number) {
        await this.repo.update({recipient: {id: userId}, readAt: IsNull()}, {readAt: new Date()})
        return {read: true}
    }

    private findWithRelations(id: number) {
        return this.repo.findOne({
            where: {id},
            relations: {actor: true, post: true, comment: true}
        })
    }
}
