import { api } from "./api";

// Curte/descurte um post (toggle). Retorna { liked: boolean }.
export function togglePostLike(postId) {
  return api(`/like/post/${postId}`, { method: "POST" });
}
