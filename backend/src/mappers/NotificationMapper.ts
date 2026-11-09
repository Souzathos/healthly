import { Notification } from "../models/Notification";
import { UserMapper } from "./UserMapper";

export class NotificationMapper {
    static toResponse(notification: Notification) {
        return {
            id: notification.id,
            type: notification.type,
            read: notification.readAt !== null,
            createdAt: notification.createdAt,
            actor: UserMapper.toPublic(notification.actor),
            post: notification.post
                ? {id: notification.post.id, description: notification.post.description}
                : null,
            comment: notification.comment
                ? {id: notification.comment.id, text: notification.comment.text}
                : null
        }
    }
}

export type NotificationResponse = ReturnType<typeof NotificationMapper.toResponse>
