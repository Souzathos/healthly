import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { useAuth } from "../context/AuthContext";
import { useRealtime } from "../context/RealtimeContext";
import { apiError } from "../services/api";
import {
  getMessages,
  markConversationRead,
  MESSAGES_PAGE_SIZE,
  sendMessage,
} from "../services/messages";
import { notify } from "../utils/alerts";
import { colors } from "../theme/colors";
import { handleFrom } from "../utils/format";

function timeOf(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Junta mensagens novas sem repetir: a mesma mensagem chega pela resposta do envio e pelo socket
function merge(current, incoming) {
  const ids = new Set(current.map((m) => m.id));
  return [...current, ...incoming.filter((m) => !ids.has(m.id))].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id
  );
}

export const ChatPage = ({ route, navigation }) => {
  const { conversationId, user: other } = route.params;
  const { user: me } = useAuth();
  const { subscribe, refreshMessages } = useRealtime();

  // Mais recentes primeiro: a lista é invertida, então a última mensagem fica embaixo
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const focusedRef = useRef(false);

  const markRead = useCallback(async () => {
    try {
      await markConversationRead(conversationId);
      refreshMessages();
    } catch {
      // Tenta de novo na próxima mensagem ou visita
    }
  }, [conversationId, refreshMessages]);

  const load = useCallback(async () => {
    setError(false);
    try {
      const data = await getMessages(conversationId, 1);
      setMessages((current) => merge(current, data));
      setPage(1);
      setHasMore(data.length === MESSAGES_PAGE_SIZE);
      markRead();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [conversationId, markRead]);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      load();
      return () => {
        focusedRef.current = false;
      };
    }, [load])
  );

  useEffect(
    () =>
      subscribe((event, message) => {
        if (event !== "message" || message.conversationId !== conversationId) return;
        setMessages((current) => merge(current, [message]));
        if (message.senderId !== me?.id && focusedRef.current) markRead();
      }),
    [subscribe, conversationId, me?.id, markRead]
  );

  const loadOlder = async () => {
    if (!hasMore || loading || loadingMore || error) return;
    setLoadingMore(true);
    try {
      const data = await getMessages(conversationId, page + 1);
      setMessages((current) => merge(current, data));
      setPage((p) => p + 1);
      setHasMore(data.length === MESSAGES_PAGE_SIZE);
    } catch {
      // A próxima rolagem tenta de novo
    } finally {
      setLoadingMore(false);
    }
  };

  const onSend = async () => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      const message = await sendMessage(conversationId, value);
      setText("");
      setMessages((current) => merge(current, [message]));
    } catch (e) {
      notify("Não foi possível enviar", apiError(e));
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const mine = item.senderId === me?.id;
    return (
      <View className={`px-4 py-1 ${mine ? "items-end" : "items-start"}`}>
        <View
          className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
            mine ? "bg-accent rounded-br-md" : "bg-surface2 rounded-bl-md"
          }`}
        >
          <Text className={`text-sm leading-5 ${mine ? "text-dark" : "text-white"}`}>
            {item.text}
          </Text>
          <Text className={`text-[10px] mt-1 self-end ${mine ? "text-dark/60" : "text-mutedDark"}`}>
            {timeOf(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    if (error && messages.length === 0) {
      return (
        <View className="flex-1 justify-center">
          <EmptyState
            icon="x"
            message="Não foi possível carregar a conversa."
            onRetry={() => {
              setLoading(true);
              load();
            }}
          />
        </View>
      );
    }
    if (messages.length === 0) {
      return (
        <View className="flex-1 justify-center">
          <EmptyState icon="mail" message={`Diga oi para ${other?.name ?? "esta pessoa"}!`} />
        </View>
      );
    }
    return (
      <FlatList
        data={messages}
        inverted
        keyExtractor={(m) => String(m.id)}
        renderItem={renderMessage}
        onEndReached={loadOlder}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
      />
    );
  };

  const canSend = text.trim().length > 0 && !sending;

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Cabeçalho com a outra pessoa: tocar abre o perfil */}
      <View className="h-14 flex-row items-center gap-1 px-1.5 border-b border-divider">
        <IconButton name="back" label="Voltar" onPress={() => navigation.goBack()} />
        <Pressable
          onPress={() => other && navigation.navigate("UserProfile", { userId: other.id })}
          className="flex-1 flex-row items-center gap-2.5"
        >
          <Avatar user={other} size={36} />
          <View className="flex-1">
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {other?.name}
            </Text>
            <Text className="text-mutedDark text-xs" numberOfLines={1}>
              {other ? handleFrom(other) : ""}
            </Text>
          </View>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {renderBody()}

        <View className="flex-row items-end gap-2 px-4 py-2.5 border-t border-divider bg-dark">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escreva uma mensagem..."
            placeholderTextColor={colors.mutedDark}
            className={`flex-1 text-white text-sm px-4 py-2.5 rounded-2xl bg-surface2 max-h-28 ${
              Platform.OS === "web" ? "outline-none" : ""
            }`}
            maxLength={1000}
            multiline
          />
          <Pressable
            onPress={onSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensagem"
            className="w-11 h-11 items-center justify-center rounded-full"
            style={{ backgroundColor: canSend ? colors.accent : colors.divider }}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.dark} />
            ) : (
              <Icon name="send" size="md" color={canSend ? colors.dark : colors.mutedDark} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
