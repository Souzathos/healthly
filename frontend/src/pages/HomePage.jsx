import React, { useCallback, useState } from "react";
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
import { getFeed } from "../services/posts";
import { colors } from "../theme/colors";

export const HomePage = () => {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("foryou");

  const load = useCallback(async () => {
    try {
      const data = await getFeed(1);
      setPosts(data);
    } catch {
      setPosts([]);
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

  const onRefresh = () => {
    setRefreshing(true);
    load();
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
              {[
                ["foryou", "Para você"],
                ["following", "Seguindo"],
              ].map(([k, l]) => (
                <Pressable
                  key={k}
                  onPress={() => setTab(k)}
                  className="flex-1 py-3 items-center"
                  style={{
                    borderBottomWidth: 2,
                    borderBottomColor: tab === k ? colors.accent : "transparent",
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: tab === k ? "#fff" : "#666",
                      fontWeight: tab === k ? "600" : "400",
                    }}
                  >
                    {l}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <View className="py-20 items-center px-8">
              <Icon name="home" size={40} color="#333" />
              <Text className="text-muted mt-3 text-center">
                {tab === "following"
                  ? "Siga pessoas para ver posts aqui."
                  : "Nada no feed ainda. Crie o primeiro post no botão +!"}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};
