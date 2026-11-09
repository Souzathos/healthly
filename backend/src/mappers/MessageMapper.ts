import { Message } from "../models/Message";

export class MessageMapper {
    static toResponse(message: Message, conversationId: number) {
        return {
            id: message.id,
            conversationId,
            senderId: message.sender.id,
            text: message.text,
            read: message.readAt !== null,
            createdAt: message.createdAt
        }
    }
}
