import { Platform } from "react-native";
import { api } from "./api";

export function getFeed(page = 1) {
  return api(`/post/feed?page=${page}`);
}

export function getPost(id) {
  return api(`/post/${id}`);
}

export function getUserPosts(userId) {
  return api(`/post/user/${userId}`);
}

export function getLikedPosts() {
  return api("/post/liked");
}

export async function createPost(description, images) {
  const form = new FormData();
  form.append("description", description);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const name = img.fileName || `image-${i}.jpg`;
    const type = img.mimeType || "image/jpeg";

    if (Platform.OS === "web") {
      // No navegador (Expo Web), o FormData precisa de um Blob/File real —
      // o objeto {uri, name, type} só funciona no React Native nativo.
      const res = await fetch(img.uri);
      let blob = await res.blob();
      // Garante um MIME válido (o backend usa isso como Content-Type ao servir a mídia).
      if (!blob.type) blob = new Blob([blob], { type });
      form.append("images", blob, name);
    } else {
      form.append("images", { uri: img.uri, name, type });
    }
  }

  return api("/post/create", { method: "POST", body: form });
}

export function deletePost(id) {
  return api(`/post/delete/${id}`);
}
