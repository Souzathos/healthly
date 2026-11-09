import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Logo } from "../components/Logo";
import { EmptyState } from "../components/EmptyState";
import { IconButton } from "../components/IconButton";
import { useRealtime } from "../context/RealtimeContext";
import { TabStrip } from "../components/TabStrip";
import { PostCard } from "../components/PostCard";
import { FEED_PAGE_SIZE, getExplore, getFeed } from "../services/posts";
import { colors } from "../theme/colors";

const TABS = [
  { key: "foryou", label: "Para você" },
  { key: "following", label: "Seguindo" },
];

const LOADERS = {
  foryou: getExplore,
  following: getFeed,
};

export const HomePage = () => {
  const navigation = useNavigation();
  const { unreadMessages } = useRealtime();
  const [tab, setTab] = useState("foryou");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  // Descarta respostas antigas quando a aba muda no meio de uma requisição
  const requestRef = useRef(0);

  const loadFirstPage = useCallback(async (which) => {
    const request = ++requestRef.current;
    setError(false);
    try {
      const data = await LOADERS[which](1);
      if (request !== requestRef.current) return;
      setPosts(data);
      setPage(1);
      setHasMore(data.length === FEED_PAGE_SIZE);
    } catch {
      if (request === requestRef.current) setError(true);
    } finally {
      if (request === requestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFirstPage(tab);
    }, [loadFirstPage, tab])
  );

  const loadMore = async () => {
    if (!hasMore || loading || loadingMore || error) return;
    const request = requestRef.current;
    setLoadingMore(true);
    try {
      const data = await LOADERS[tab](page + 1);
      if (request !== requestRef.current) return;
      // Um post novo pode deslocar a paginação e repetir itens
      setPosts((current) => {
        const ids = new Set(current.map((p) => p.id));
        return [...current, ...data.filter((p) => !ids.has(p.id))];
      });
      setPage((p) => p + 1);
      setHasMore(data.length === FEED_PAGE_SIZE);
    } catch {
      // Mantém o que já carregou; a próxima rolagem tenta de novo
    } finally {
      setLoadingMore(false);
    }
  };

  const selectTab = (next) => {
    if (next === tab) return;
    setTab(next);
    setPosts([]);
    setHasMore(true);
    setLoading(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFirstPage(tab);
  };

  const retry = () => {
    setLoading(true);
    loadFirstPage(tab);
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
        <EmptyState icon="x" message="Não foi possível carregar o feed." onRetry={retry} />
      );
    }
    return (
      <EmptyState
        icon="home"
        message={
          tab === "following"
            ? "Siga pessoas para ver posts aqui. Encontre alguém na busca."
            : "Nada por aqui ainda. Crie o primeiro post no botão +!"
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Header */}
      <View className="h-12 pl-4 pr-1.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Logo size={30} />
          <Text className="text-accent text-xl font-bold">Healthly</Text>
        </View>
        <IconButton
          name="mail"
          label="Mensagens"
          color={colors.muted}
          badge={unreadMessages}
          onPress={() => navigation.navigate("Conversations")}
        />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPressUser={() =>
              item.user &&
              navigation.navigate("UserProfile", { userId: item.user.id })
            }
            onPressPost={() =>
              navigation.navigate("PostDetail", { postId: item.id })
            }
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={<TabStrip tabs={TABS} value={tab} onChange={selectTab} />}
        ListEmptyComponent={renderEmpty}
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
