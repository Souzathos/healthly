import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { EmptyState } from "./EmptyState";
import { PostCard } from "./PostCard";
import { FEED_PAGE_SIZE } from "../services/posts";
import { colors } from "../theme/colors";

// Lista de posts com scroll infinito, atualização puxando e estados de vazio e erro.
// loader(page) busca uma página; mudar reloadKey recarrega do início.
export const PostFeed = ({
  loader,
  reloadKey,
  ListHeaderComponent,
  emptyIcon = "grid",
  emptyMessage = "Nenhum post encontrado.",
  errorMessage = "Não foi possível carregar os posts.",
}) => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const requestRef = useRef(0);

  const loadFirst = useCallback(async () => {
    const request = ++requestRef.current;
    setError(false);
    try {
      const data = await loaderRef.current(1);
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

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    loadFirst();
  }, [reloadKey, loadFirst]);

  const loadMore = async () => {
    if (!hasMore || loading || loadingMore || error) return;
    const request = requestRef.current;
    setLoadingMore(true);
    try {
      const data = await loaderRef.current(page + 1);
      if (request !== requestRef.current) return;
      setPosts((current) => {
        const ids = new Set(current.map((p) => p.id));
        return [...current, ...data.filter((p) => !ids.has(p.id))];
      });
      setPage((p) => p + 1);
      setHasMore(data.length === FEED_PAGE_SIZE);
    } catch {
      // A próxima rolagem tenta de novo
    } finally {
      setLoadingMore(false);
    }
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
          message={errorMessage}
          onRetry={() => {
            setLoading(true);
            loadFirst();
          }}
        />
      );
    }
    return <EmptyState icon={emptyIcon} message={emptyMessage} />;
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(p) => String(p.id)}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPressUser={() => item.user && navigation.push("UserProfile", { userId: item.user.id })}
          onPressPost={() => navigation.push("PostDetail", { postId: item.id })}
        />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadFirst();
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
  );
};
