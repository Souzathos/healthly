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

export function createPost(description, images) {
  const form = new FormData();
  form.append("description", description);
  images.forEach((img, i) => {
    form.append("images", {
      uri: img.uri,
      name: img.fileName || `image-${i}.jpg`,
      type: img.mimeType || "image/jpeg",
    });
  });

  return api("/post/create", { method: "POST", body: form });
}

export function deletePost(id) {
  return api(`/post/delete/${id}`);
}
