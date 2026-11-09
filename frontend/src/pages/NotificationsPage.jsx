import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRealtime } from "../context/RealtimeContext";
import { getNotifications, NOTIFICATIONS_PAGE_SIZE } from "../services/notifications";
import { colors } from "../theme/colors";
import { timeAgo } from "../utils/format";

const KIND = {
  like: { icon: "heartFill", color: colors.danger, text: "curtiu seu post" },
  comment: { icon: "comment", color: colors.accent2, text: "comentou no seu post" },
  follow: { icon: "user", color: colors.accent, text: "começou a seguir você" },
  repost: { icon: "repeat", color: colors.accent2, text: "repostou seu post" },
};

function excerpt(text, size = 60) {
  if (!text) return "";
  return text.length > size ? `${text.slice(0, size).trim()}…` : text;
}

export const NotificationsPage = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { markAllRead, subscribe } = useRealtime();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const requestRef = useRef(0);

  // Carrega a primeira página. Os itens chegam com o estado de lido de antes da visita,
  // para destacar o que é novo; logo depois tudo é marcado como lido.
  const load = useCallback(async () => {
    const request = ++requestRef.current;
    setError(false);
    try {
      const data = await getNotifications(1);
      if (request !== requestRef.current) return;
      setItems(data);
      setPage(1);
      setHasMore(data.length === NOTIFICATIONS_PAGE_SIZE);
      markAllRead();
    } catch {
      if (request === requestRef.current) setError(true);
    } finally {
      if (request === requestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [markAllRead]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Avisos ao vivo enquanto a tela está aberta
  const focusedRef = useRef(isFocused);
  focusedRef.current = isFocused;
  useEffect(
    () =>
      subscribe((event, notification) => {
        if (event === "new") {
          setItems((list) =>
            list.some((n) => n.id === notification.id) ? list : [notification, ...list]
          );
          if (focusedRef.current) markAllRead();
        } else if (event === "removed" && focusedRef.current) {
          load();
        }
      }),
    [subscribe, markAllRead, load]
  );

  const loadMore = async () => {
    if (!hasMore || loading || loadingMore || error) return;
    setLoadingMore(true);
    try {
      const data = await getNotifications(page + 1);
      setItems((list) => {
        const ids = new Set(list.map((n) => n.id));
        return [...list, ...data.filter((n) => !ids.has(n.id))];
      });
      setPage((p) => p + 1);
      setHasMore(data.length === NOTIFICATIONS_PAGE_SIZE);
    } catch {
      // A próxima rolagem tenta de novo
    } finally {
      setLoadingMore(false);
    }
  };

  const openActor = (item) => navigation.navigate("UserProfile", { userId: item.actor.id });

  const openItem = (item) => {
    if (item.post) navigation.navigate("PostDetail", { postId: item.post.id });
    else openActor(item);
  };

  const renderItem = ({ item }) => {
    const kind = KIND[item.type];
    const detail = item.comment ? `"${excerpt(item.comment.text)}"` : excerpt(item.post?.description);

    return (
      <Pressable
        onPress={() => openItem(item)}
        className={`flex-row gap-3 px-4 py-3.5 border-b border-divider active:opacity-80 ${
          item.read ? "" : "bg-surface"
        }`}
      >
        <View>
          <Avatar user={item.actor} size={44} onPress={() => openActor(item)} />
          <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center bg-surface border-2 border-dark">
            <Icon name={kind.icon} size="sm" color={kind.color} strokeWidth={2} />
          </View>
        </View>

        <View className="flex-1 justify-center">
          <Text className="text-white text-sm leading-5">
            <Text className="font-semibold">{item.actor.name}</Text>{" "}
            <Text className="text-muted">{kind.text}</Text>
          </Text>
          {detail ? (
            <Text className="text-mutedDark text-[13px] mt-0.5" numberOfLines={1}>
              {detail}
            </Text>
          ) : null}
        </View>

        <View className="items-end justify-center gap-1.5">
          <Text className="text-mutedDark text-xs">{timeAgo(item.createdAt)}</Text>
          {item.read ? null : <View className="w-2 h-2 rounded-full bg-accent" />}
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
          message="Não foi possível carregar as notificações."
          onRetry={() => {
            setLoading(true);
            load();
          }}
        />
      );
    }
    return (
      <EmptyState
        icon="bell"
        message="Nenhuma notificação por enquanto. Curtidas, comentários e novos seguidores aparecem aqui."
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <ScreenHeader title="Notificações" />
      <FlatList
        data={items}
        keyExtractor={(n) => String(n.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
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
        ListFooterComponent={
          loadingMore ? (
            <View className="py-6 items-center">
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};
