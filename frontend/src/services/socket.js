import { io } from "socket.io-client";
import { API_URL } from "./api";

// Mesmo endereço e mesmo token da API REST
export function connectSocket(token) {
  return io(API_URL, {
    auth: { token },
    transports: ["websocket"],
  });
}
