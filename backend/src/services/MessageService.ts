import { In, IsNull, Not } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { BadRequestError, NotFoundError } from "../errors";
import { ConversationMapper } from "../mappers/ConversationMapper";
import { MessageMapper } from "../mappers/MessageMapper";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { emitToUser } from "../realtime/socket";
import { Pagination } from "../utils/pagination";

export class MessageService {
    private conversationRepo = AppDataSource.getRepository(Conversation)
    private messageRepo = AppDataSource.getRepository(Message)
    private userRepo = AppDataSource.getRepository(User)

    // Abre a conversa com alguém, criando na primeira vez
    async open(viewerId: number, otherId: number) {
        if(viewerId === otherId) throw new BadRequestError('Você não pode conversar consigo mesmo')

        const other = await this.userRepo.findOneBy({id: otherId})
        if(!other) throw new NotFoundError('Usuário não encontrado')

        const [userA, userB] = viewerId < otherId ? [viewerId, otherId] : [otherId, viewerId]
        const where = {userA: {id: userA}, userB: {id: userB}}

        let conversation = await this.conversationRepo.findOne({where, relations: {userA: true, userB: true}})
        if(!conversation) {
            try {
                await this.conversationRepo.save(this.conversationRepo.create(where))
            } catch(error: any) {
                // Os dois abriram a conversa ao mesmo tempo: a outra requisição já criou
                if(error.driverError?.code !== 'ER_DUP_ENTRY') throw error
            }
            conversation = await this.conversationRepo.findOneOrFail({where, relations: {userA: true, userB: true}})
        }

        const [response] = await this.toResponses([conversation], viewerId)
        return response
    }

    async list(viewerId: number, {skip, take}: Pagination) {
        const conversations = await this.conversationRepo.createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.userA', 'userA')
            .leftJoinAndSelect('conversation.userB', 'userB')
            .where('(userA.id = :viewerId OR userB.id = :viewerId)', {viewerId})
            // Conversas abertas mas ainda sem mensagens não aparecem na lista
            .andWhere('conversation.lastMessageAt IS NOT NULL')
            .orderBy('conversation.lastMessageAt', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return this.toResponses(conversations, viewerId)
    }

    async messages(conversationId: number, viewerId: number, {skip, take}: Pagination) {
        await this.findForParticipant(conversationId, viewerId)

        const messages = await this.messageRepo.find({
            where: {conversation: {id: conversationId}},
            relations: {sender: true},
            order: {createdAt: 'DESC', id: 'DESC'},
            skip,
            take
        })
        return messages.map(m => MessageMapper.toResponse(m, conversationId))
    }

    async send(conversationId: number, senderId: number, text: string) {
        const conversation = await this.findForParticipant(conversationId, senderId)

        const saved = await this.messageRepo.save(this.messageRepo.create({
            conversation: {id: conversationId},
            sender: {id: senderId},
            text
        }))
        await this.conversationRepo.update({id: conversationId}, {lastMessageAt: saved.createdAt})

        const message = await this.messageRepo.findOneOrFail({where: {id: saved.id}, relations: {sender: true}})
        const response = MessageMapper.toResponse(message, conversationId)

        // Os dois participantes recebem: quem enviou pode estar com o app aberto em outro aparelho
        emitToUser(conversation.userA.id, 'message:new', response)
        emitToUser(conversation.userB.id, 'message:new', response)

        return response
    }

    // Marca como lidas as mensagens que a outra pessoa enviou
    async markRead(conversationId: number, viewerId: number) {
        await this.findForParticipant(conversationId, viewerId)

        await this.messageRepo.update(
            {conversation: {id: conversationId}, sender: {id: Not(viewerId)}, readAt: IsNull()},
            {readAt: new Date()}
        )
        return {read: true}
    }

    async unreadCount(viewerId: number) {
        const count = await this.messageRepo.createQueryBuilder('message')
            .innerJoin('message.conversation', 'conversation')
            .where('(conversation.userAId = :viewerId OR conversation.userBId = :viewerId)', {viewerId})
            .andWhere('message.senderId != :viewerId', {viewerId})
            .andWhere('message.readAt IS NULL')
            .getCount()

        return {count}
    }

    private async findForParticipant(conversationId: number, viewerId: number) {
        const conversation = await this.conversationRepo.findOne({
            where: {id: conversationId},
            relations: {userA: true, userB: true}
        })
        // Conversa de outras pessoas responde como inexistente, sem revelar que existe
        if(!conversation || (conversation.userA.id !== viewerId && conversation.userB.id !== viewerId)) {
            throw new NotFoundError('Conversa não encontrada')
        }
        return conversation
    }

    private async toResponses(conversations: Conversation[], viewerId: number) {
        const ids = conversations.map(c => c.id)
        if(ids.length === 0) return []

        // Última mensagem de cada conversa e quantas a pessoa ainda não leu
        const lastIds = await this.messageRepo.createQueryBuilder('message')
            .select('MAX(message.id)', 'id')
            .where('message.conversationId IN (:...ids)', {ids})
            .groupBy('message.conversationId')
            .getRawMany()

        const lastMessages = lastIds.length
            ? await this.messageRepo.find({
                where: {id: In(lastIds.map(row => Number(row.id)))},
                relations: {sender: true, conversation: true}
            })
            : []

        const unreadRows = await this.messageRepo.createQueryBuilder('message')
            .select('message.conversationId', 'conversationId')
            .addSelect('COUNT(*)', 'total')
            .where('message.conversationId IN (:...ids)', {ids})
            .andWhere('message.senderId != :viewerId', {viewerId})
            .andWhere('message.readAt IS NULL')
            .groupBy('message.conversationId')
            .getRawMany()

        const lastByConversation = new Map(lastMessages.map(m => [m.conversation.id, m]))
        const unreadByConversation = new Map(unreadRows.map(row => [Number(row.conversationId), Number(row.total)]))

        return conversations.map(c => ConversationMapper.toResponse(
            c,
            viewerId,
            lastByConversation.get(c.id) ?? null,
            unreadByConversation.get(c.id) ?? 0
        ))
    }
}
