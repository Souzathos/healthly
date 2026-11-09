import { api } from "./api";

// Curte/descurte um post (toggle). Retorna { liked: boolean }.
export function togglePostLike(postId) {
  return api(`/like/post/${postId}`, { method: "POST" });
}

// Curte/descurte um comentário (toggle). Retorna { liked: boolean }.
export function toggleCommentLike(commentId) {
  return api(`/like/comment/${commentId}`, { method: "POST" });
}
