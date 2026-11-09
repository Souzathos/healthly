import { api } from "./api";

// Lista os comentários de um post (mais recentes primeiro).
export function listComments(postId) {
  return api(`/comment/post/${postId}`);
}

// Cria um comentário no post.
export function createComment(postId, text) {
  return api(`/comment/${postId}`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

// Só o autor do comentário pode excluir.
export function deleteComment(commentId) {
  return api(`/comment/${commentId}`, { method: "DELETE" });
}
