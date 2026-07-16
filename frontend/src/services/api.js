import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Em React Native não existe import.meta.env (isso é do Vite/web).
// No Expo usamos process.env.EXPO_PUBLIC_* ; com fallback por plataforma:
// - Emulador Android: http://10.0.2.2:3000
// - iOS simulator / web: http://localhost:3000
// - Device físico: defina EXPO_PUBLIC_API_URL=http://<IP-da-sua-maquina>:3000
const HOST =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || HOST;

export const TOKEN_KEY = "healthly_token";

// Cliente HTTP central baseado em fetch.
// Injeta o token JWT automaticamente e devolve o JSON já parseado.
export async function api(path, options = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const isForm = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      // FormData define o próprio Content-Type (com boundary); não sobrescreva.
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error((data && data.message) || "Erro inesperado");
  }

  return data;
}

// URL absoluta de uma mídia (imagem) de post — usada direto no <Image>.
export const mediaUrl = (mediaId) => `${API_URL}/post/media/${mediaId}`;

// Mensagem de erro amigável (os erros de api() já vêm como Error(message)).
export function apiError(e) {
  return e?.message || "Algo deu errado. Tente novamente.";
}
