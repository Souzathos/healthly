import { Comment } from "../models/Comment";
import { UserMapper } from "./UserMapper";

export class CommentMapper {
    static toResponse(comment: Comment, likesCount: number) {
        return {
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            user: UserMapper.toPublic(comment.user),
            likesCount
        }
    }
}
