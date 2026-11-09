import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { ScreenHeader } from "../components/ScreenHeader";
import { Badge } from "../components/ui/badge";
import { Text as BadgeText } from "../components/ui/text";
import { useRealtime } from "../context/RealtimeContext";
import { listConversations } from "../services/messages";
import { colors } from "../theme/colors";
import { handleFrom, timeAgo } from "../utils/format";

export const ConversationsPage = () => {
  const navigation = useNavigation();
  const { subscribe } = useRealtime();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      setConversations(await listConversations());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Mensagem nova em qualquer conversa reordena a lista e atualiza a prévia
  useEffect(
    () =>
      subscribe((event) => {
        if (event === "message") load();
      }),
    [subscribe, load]
  );

  const renderItem = ({ item }) => {
    const unread = item.unreadCount > 0;
    const preview = item.lastMessage
      ? `${item.lastMessage.fromMe ? "Você: " : ""}${item.lastMessage.text}`
      : "";

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("Chat", { conversationId: item.id, user: item.user })
        }
        className="flex-row items-center gap-3 px-4 py-3.5 border-b border-divider active:opacity-80"
      >
        <Avatar user={item.user} size={48} />
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-white font-semibold text-sm" numberOfLines={1}>
              {item.user.name}
            </Text>
            <Text className="text-mutedDark text-xs" numberOfLines={1}>
              {handleFrom(item.user)}
            </Text>
          </View>
          <Text
            className={`text-[13px] mt-0.5 ${unread ? "text-white font-semibold" : "text-muted"}`}
            numberOfLines={1}
          >
            {preview}
          </Text>
        </View>
        <View className="items-end gap-1.5">
          <Text className="text-mutedDark text-xs">{timeAgo(item.lastMessage?.createdAt)}</Text>
          {unread ? (
            <Badge variant="count">
              <BadgeText>{item.unreadCount}</BadgeText>
            </Badge>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="py-16 items-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    if (error) {
      return (
        <EmptyState
          icon="x"
          message="Não foi possível carregar as conversas."
          onRetry={() => {
            setLoading(true);
            load();
          }}
        />
      );
    }
    return (
      <EmptyState
        icon="mail"
        message="Nenhuma conversa ainda. Abra o perfil de alguém e toque em Mensagem."
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <ScreenHeader title="Mensagens" onBack={() => navigation.goBack()} />
      <FlatList
        data={conversations}
        keyExtractor={(c) => String(c.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.accent}
          />
        }
      />
    </SafeAreaView>
  );
};
