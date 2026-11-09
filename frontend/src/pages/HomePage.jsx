import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Logo } from "../components/Logo";
import { Icon } from "../components/Icon";
import { StoryRow } from "../components/StoryRow";
import { PostCard } from "../components/PostCard";
import { FEED_PAGE_SIZE, getExplore, getFeed } from "../services/posts";
import { colors } from "../theme/colors";

const TABS = [
  ["foryou", "Para você"],
  ["following", "Seguindo"],
];

const LOADERS = {
  foryou: getExplore,
  following: getFeed,
};

export const HomePage = () => {
  const navigation = useNavigation();
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
        <View className="py-20 items-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    if (error) {
      return (
        <View className="py-20 items-center px-8">
          <Icon name="x" size={40} color="#333" />
          <Text className="text-muted mt-3 text-center">
            Não foi possível carregar o feed.
          </Text>
          <Pressable onPress={retry} className="mt-4 px-5 py-2.5 rounded-full border border-accent">
            <Text className="text-accent font-semibold text-sm">Tentar de novo</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View className="py-20 items-center px-8">
        <Icon name="home" size={40} color="#333" />
        <Text className="text-muted mt-3 text-center">
          {tab === "following"
            ? "Siga pessoas para ver posts aqui. Encontre alguém na busca."
            : "Nada por aqui ainda. Crie o primeiro post no botão +!"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-1 pb-1 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Logo size={30} />
          <Text className="text-accent text-xl font-bold">Healthly</Text>
        </View>
        <Icon name="mail" size={24} color={colors.muted} />
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
        ListHeaderComponent={
          <View>
            <StoryRow onAdd={() => navigation.navigate("Create")} />
            <View className="flex-row border-b border-[#1a1a1a]">
              {TABS.map(([key, label]) => (
                <Pressable
                  key={key}
                  onPress={() => selectTab(key)}
                  className="flex-1 py-3 items-center"
                  style={{
                    borderBottomWidth: 2,
                    borderBottomColor: tab === key ? colors.accent : "transparent",
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: tab === key ? "#fff" : "#666",
                      fontWeight: tab === key ? "600" : "400",
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
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
