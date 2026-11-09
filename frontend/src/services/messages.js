import { api } from "./api";

export const MESSAGES_PAGE_SIZE = 30;

export function listConversations() {
  return api("/conversations");
}

// Abre (ou cria) a conversa com alguém
export function openConversation(userId) {
  return api(`/conversations/with/${userId}`, { method: "POST" });
}

// Mais recentes primeiro
export function getMessages(conversationId, page = 1) {
  return api(`/conversations/${conversationId}/messages?page=${page}&limit=${MESSAGES_PAGE_SIZE}`);
}

export function sendMessage(conversationId, text) {
  return api(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function markConversationRead(conversationId) {
  return api(`/conversations/${conversationId}/read`, { method: "PATCH" });
}

export function getUnreadMessages() {
  return api("/conversations/unread-count");
}
