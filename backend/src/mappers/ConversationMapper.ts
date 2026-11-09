import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { UserMapper } from "./UserMapper";

export class ConversationMapper {
    // A conversa vista por um dos participantes: mostra a outra pessoa
    static toResponse(conversation: Conversation, viewerId: number, lastMessage: Message | null, unreadCount: number) {
        const other = conversation.userA.id === viewerId ? conversation.userB : conversation.userA

        return {
            id: conversation.id,
            user: UserMapper.toPublic(other),
            lastMessage: lastMessage
                ? {
                    text: lastMessage.text,
                    createdAt: lastMessage.createdAt,
                    fromMe: lastMessage.sender.id === viewerId
                }
                : null,
            unreadCount
        }
    }
}
