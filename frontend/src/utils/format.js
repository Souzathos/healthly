import { avatarColors } from "../theme/colors";

export function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function colorFromId(id, name) {
  const seed =
    id ??
    (name ? name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : 0);
  return avatarColors[seed % avatarColors.length];
}

export function formatCount(n) {
  if (!n) return "0";
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

export function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function handleFrom(user) {
  if (user.handle)
    return user.handle.startsWith("@") ? user.handle : `@${user.handle}`;
  const base = (user.name || "user").toLowerCase().replace(/\s+/g, "");
  return `@${base}`;
}
