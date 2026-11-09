import { Comment } from "../models/Comment";
import { UserMapper } from "./UserMapper";

export type CommentViewerState = {
    likesCount: number
    likedByMe: boolean
}

export class CommentMapper {
    static toResponse(comment: Comment, state: CommentViewerState) {
        return {
            id: comment.id,
            text: comment.text,
            createdAt: comment.createdAt,
            user: UserMapper.toPublic(comment.user),
            likesCount: state.likesCount,
            likedByMe: state.likedByMe
        }
    }
}
