import { api } from "./api";

export function getMe() {
  return api("/user/me");
}

export function getProfile(id) {
  return api(`/user/${id}`);
}

// Busca por nome ou @usuário. Cada resultado traz isFollowing.
export function searchUsers(q, page = 1) {
  return api(`/user/search?q=${encodeURIComponent(q)}&page=${page}`);
}

// Segue ou deixa de seguir (toggle). Retorna { following: boolean }.
export function toggleFollow(userId) {
  return api(`/follow/${userId}`, { method: "POST" });
}

export function updateUser(payload) {
  return api("/user/update", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAccount() {
  return api("/user/delete", { method: "DELETE" });
}
