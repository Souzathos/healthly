import { api } from "./api";

export function login(email, password) {
  return api("/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(payload) {
  return api("/user/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
