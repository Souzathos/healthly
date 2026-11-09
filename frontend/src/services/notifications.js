import { api } from "./api";

export function getNotifications(page = 1) {
  return api(`/notifications?page=${page}&limit=${NOTIFICATIONS_PAGE_SIZE}`);
}

export function getUnreadCount() {
  return api("/notifications/unread-count");
}

export function markAllNotificationsRead() {
  return api("/notifications/read-all", { method: "PATCH" });
}

export const NOTIFICATIONS_PAGE_SIZE = 20;
