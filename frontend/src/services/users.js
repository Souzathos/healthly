import { api } from "./api";

export function getMe() {
  return api("/user/me");
}

export function getProfile(id) {
  return api(`/user/${id}`);
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
