import { api } from "./api";

// Salva/remove um post dos salvos (toggle). Retorna { saved: boolean }.
export function toggleSaved(postId) {
  return api(`/saved/${postId}`, { method: "POST" });
}

// Lista os posts salvos pelo usuário logado.
export function getSaved() {
  return api("/saved");
}
