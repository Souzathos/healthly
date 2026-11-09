import { api } from "./api";
import { appendImage } from "./upload";

// Seguindo: posts de quem o usuário segue + os próprios.
export function getFeed(page = 1) {
  return api(`/post/feed?page=${page}`);
}

// Para você: posts de todo mundo.
export function getExplore(page = 1) {
  return api(`/post/explore?page=${page}`);
}

// Tamanho de página do feed no backend: uma página menor que isso é a última.
export const FEED_PAGE_SIZE = 10;

export function getPost(id) {
  return api(`/post/${id}`);
}

export function getUserPosts(userId) {
  return api(`/post/user/${userId}`);
}

export function getLikedPosts() {
  return api("/post/liked");
}

export async function createPost(description, images, diet = null) {
  const form = new FormData();
  form.append("description", description);
  form.append("diet", diet ?? "");

  for (let i = 0; i < images.length; i++) {
    await appendImage(form, "images", images[i], i);
  }

  return api("/post/create", { method: "POST", body: form });
}

// Busca por texto e/ou dieta (RF08, RF18)
export function searchPosts({ q = "", diet = null, page = 1 }) {
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);
  if (diet) params.set("diet", diet);
  return api(`/post/search?${params.toString()}`);
}

// Posts de uma hashtag, sem o # (RF19)
export function getHashtagPosts(tag, page = 1) {
  return api(`/post/hashtag/${encodeURIComponent(tag)}?page=${page}`);
}

// [{ name, postsCount }] das hashtags mais usadas na semana
export function getTrendingHashtags() {
  return api("/post/trending-hashtags");
}

// Reposta ou desfaz (toggle). Retorna { reposted: boolean }.
export function toggleRepost(postId) {
  return api(`/post/${postId}/repost`, { method: "POST" });
}

export function deletePost(id) {
  return api(`/post/delete/${id}`, { method: "DELETE" });
}
