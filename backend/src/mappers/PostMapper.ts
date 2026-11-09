import { Post } from "../models/Post";
import { UserMapper } from "./UserMapper";

export type PostCounts = {
    likesCount: number
    commentsCount: number
}

export type PostViewerState = PostCounts & {
    likedByMe: boolean
    savedByMe: boolean
}

export class PostMapper {
    // Post com autor, como aparece no feed, no detalhe e nas listas
    static toResponse(post: Post, state: PostViewerState) {
        return {
            id: post.id,
            description: post.description,
            images: PostMapper.images(post),
            createdAt: post.createdAt,
            user: post.user ? UserMapper.toPublic(post.user) : null,
            likesCount: state.likesCount,
            commentsCount: state.commentsCount,
            likedByMe: state.likedByMe,
            savedByMe: state.savedByMe
        }
    }

    // Post dentro do perfil: o autor já é o dono da página
    static toSummary(post: Post, counts: PostCounts) {
        return {
            id: post.id,
            description: post.description,
            images: PostMapper.images(post),
            createdAt: post.createdAt,
            likesCount: counts.likesCount,
            commentsCount: counts.commentsCount
        }
    }

    // Só os metadados, na ordem de envio: o arquivo é servido por /post/media/:mediaId
    private static images(post: Post) {
        return [...(post.images ?? [])].sort((a, b) => a.position - b.position).map(image => ({
            id: image.id,
            position: image.position,
            mimeType: image.mimeType
        }))
    }
}

export type PostResponse = ReturnType<typeof PostMapper.toResponse>
