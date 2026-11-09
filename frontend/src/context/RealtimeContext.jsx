import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { useAuth } from "./AuthContext";
import { connectSocket } from "../services/socket";
import { getUnreadCount, markAllNotificationsRead } from "../services/notifications";
import { getUnreadMessages } from "../services/messages";

const RealtimeContext = createContext({
  unreadCount: 0,
  unreadMessages: 0,
  refreshMessages: async () => {},
  markAllRead: async () => {},
  subscribe: () => () => {},
});

// Uma única conexão de socket para notificações e mensagens.
// O REST é a fonte da verdade; o socket só avisa que algo mudou.
// Por isso os contadores são buscados de novo ao conectar, reconectar e voltar para o app.
export const RealtimeProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const listeners = useRef(new Set());
  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;

  const refreshMessages = useCallback(async () => {
    try {
      const { count } = await getUnreadMessages();
      setUnreadMessages(count);
    } catch {
      // Mantém o último valor conhecido
    }
  }, []);

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Mantém o último valor conhecido
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      setUnreadMessages(0);
      return;
    }

    const socket = connectSocket(token);
    const emit = (event, payload) => listeners.current.forEach((listener) => listener(event, payload));

    const refreshAll = () => {
      refreshCount();
      refreshMessages();
    };

    socket.on("connect", refreshAll);
    socket.on("message:new", (message) => {
      if (message.senderId !== userIdRef.current) refreshMessages();
      emit("message", message);
    });
    socket.on("notification:new", (notification) => {
      setUnreadCount((count) => count + 1);
      emit("new", notification);
    });
    socket.on("notification:removed", () => {
      refreshCount();
      emit("removed");
    });

    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshAll();
    });

    return () => {
      socket.disconnect();
      appState.remove();
    };
  }, [token, refreshCount, refreshMessages]);

  const markAllRead = useCallback(async () => {
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      refreshCount();
    }
  }, [refreshCount]);

  // Telas que querem reagir a avisos ao vivo. Retorna a função para cancelar.
  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const value = useMemo(
    () => ({ unreadCount, unreadMessages, refreshMessages, markAllRead, subscribe }),
    [unreadCount, unreadMessages, refreshMessages, markAllRead, subscribe]
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
