import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { getMe, getProfile, toggleFollow } from "../services/users";
import { getLikedPosts } from "../services/posts";
import { getSaved } from "../services/saved";
import { apiError, mediaUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { notify } from "../utils/alerts";
import { colors } from "../theme/colors";
import { formatCount, handleFrom, timeAgo } from "../utils/format";

const TAB_LOADERS = {
  curtidas: getLikedPosts,
  salvos: getSaved,
};

export const ProfilePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user: me, signOut } = useAuth();
  const paramUserId = route.params?.userId;
  const isOwn = !paramUserId || paramUserId === me?.id;
  const profileKey = isOwn ? "me" : String(paramUserId);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const [tab, setTab] = useState("posts");
  // null = ainda não carregado
  const [tabData, setTabData] = useState({ curtidas: null, salvos: null });
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState(false);

  const loadedKey = useRef(null);
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const requestRef = useRef(0);

  const loadTab = useCallback(async (which) => {
    setTabLoading(true);
    setTabError(false);
    try {
      const data = await TAB_LOADERS[which]();
      setTabData((current) => ({ ...current, [which]: data }));
    } catch {
      setTabError(true);
    } finally {
      setTabLoading(false);
    }
  }, []);

  // Outro perfil: começa do zero. Mesmo perfil (ex.: voltando de um post): atualiza sem perder a aba.
  const loadProfile = useCallback(
    async (fromScratch) => {
      const request = ++requestRef.current;
      if (fromScratch) {
        setLoading(true);
        setProfile(null);
        setTab("posts");
        setTabData({ curtidas: null, salvos: null });
      }
      setError(false);

      try {
        const data = isOwn ? await getMe() : await getProfile(paramUserId);
        if (request !== requestRef.current) return;
        setProfile(data);
        setFollowing(!!data.isFollowing);
        loadedKey.current = profileKey;

        if (!fromScratch) {
          setTabData({ curtidas: null, salvos: null });
          if (TAB_LOADERS[tabRef.current]) loadTab(tabRef.current);
        }
      } catch {
        // Numa atualização que falha, mantém o perfil que já está na tela
        if (request === requestRef.current && fromScratch) setError(true);
      } finally {
        if (request === requestRef.current) setLoading(false);
      }
    },
    [isOwn, paramUserId, profileKey, loadTab]
  );

  useFocusEffect(
    useCallback(() => {
      loadProfile(loadedKey.current !== profileKey);
    }, [loadProfile, profileKey])
  );

  const selectTab = (next) => {
    setTab(next);
    if (TAB_LOADERS[next] && tabData[next] === null) loadTab(next);
  };

  const onToggleFollow = async () => {
    if (followBusy || !profile) return;
    const prev = following;
    const adjustFollowers = (delta) =>
      setProfile((p) => ({ ...p, followersCount: p.followersCount + delta }));

    setFollowBusy(true);
    setFollowing(!prev);
    adjustFollowers(prev ? -1 : 1);
    try {
      await toggleFollow(profile.id);
    } catch (e) {
      setFollowing(prev);
      adjustFollowers(prev ? 1 : -1);
      notify("Não foi possível seguir", apiError(e));
    } finally {
      setFollowBusy(false);
    }
  };

  const header = (
    <View className="px-4 pb-2 flex-row items-center justify-between">
      {isOwn ? (
        <View style={{ width: 24 }} />
      ) : (
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color="#fff" />
        </Pressable>
      )}
      <Text className="text-white font-semibold text-base">
        {profile ? handleFrom(profile) : ""}
      </Text>
      {isOwn ? (
        <Pressable onPress={signOut}>
          <Icon name="logout" size={22} color="#fff" />
        </Pressable>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );

  if (error && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
        {header}
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="user" size={40} color="#333" />
          <Text className="text-muted mt-3 text-center">
            Não foi possível carregar o perfil.
          </Text>
          <Pressable
            onPress={() => loadProfile(true)}
            className="mt-4 px-5 py-2.5 rounded-full border border-accent"
          >
            <Text className="text-accent font-semibold text-sm">Tentar de novo</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  const stats = [
    [formatCount(profile.postsCount), "Posts"],
    [formatCount(profile.followersCount), "Seguidores"],
    [formatCount(profile.followingCount), "Seguindo"],
  ];

  const tabs = [
    { key: "posts", label: "Posts" },
    ...(isOwn
      ? [
          { key: "curtidas", label: "Curtidas" },
          { key: "salvos", label: "Salvos" },
        ]
      : []),
  ];

  const currentList = tab === "posts" ? profile.posts : tabData[tab];

  const emptyLabel =
    tab === "posts"
      ? "Nenhum post ainda"
      : tab === "curtidas"
      ? "Nenhuma curtida ainda"
      : "Nenhum post salvo ainda";

  const renderPostRow = (post) => (
    <Pressable
      key={post.id}
      onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
      className="px-4 py-4 border-b border-[#1a1a1a]"
    >
      {tab !== "posts" ? (
        <View className="flex-row items-center gap-2 mb-1.5">
          <Avatar user={post.user} size={22} />
          <Text className="text-white text-xs font-semibold">
            {post.user?.name}
          </Text>
          <Text className="text-[#555] text-xs">
            {post.user ? handleFrom(post.user) : ""}
          </Text>
        </View>
      ) : null}
      {post.description ? (
        <Text className="text-[#e0e0e0] text-sm leading-6">
          {post.description}
        </Text>
      ) : null}
      {post.images?.[0] ? (
        <Image
          source={{ uri: mediaUrl(post.images[0].id) }}
          className="w-full rounded-2xl mt-3"
          style={{ height: 180, backgroundColor: "#1a1a1a" }}
          resizeMode="cover"
        />
      ) : null}
      <View className="flex-row gap-5 mt-2.5">
        <Text className="text-[#555] text-xs">
          <Text className="text-white font-semibold">
            {formatCount(post.likesCount)}
          </Text>{" "}
          curtidas
        </Text>
        <Text className="text-[#555] text-xs">
          <Text className="text-white font-semibold">
            {formatCount(post.commentsCount)}
          </Text>{" "}
          respostas
        </Text>
        <Text className="text-[#555] text-xs">{timeAgo(post.createdAt)}</Text>
      </View>
    </Pressable>
  );

  const renderTabContent = () => {
    if (tabLoading && tab !== "posts") {
      return (
        <View className="items-center py-16">
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    if (tabError && tab !== "posts") {
      return (
        <View className="items-center py-16 px-8">
          <Text className="text-muted text-center">
            Não foi possível carregar esta aba.
          </Text>
          <Pressable
            onPress={() => loadTab(tab)}
            className="mt-4 px-5 py-2.5 rounded-full border border-accent"
          >
            <Text className="text-accent font-semibold text-sm">Tentar de novo</Text>
          </Pressable>
        </View>
      );
    }
    if (currentList && currentList.length > 0) {
      return currentList.map(renderPostRow);
    }
    return (
      <View className="items-center py-16">
        <Icon name="grid" size={40} color="#333" />
        <Text className="text-muted mt-3">{emptyLabel}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {header}

      <ScrollView className="flex-1">
        {/* Cover */}
        <View style={{ height: 110 }}>
          <View
            style={{
              height: "100%",
              backgroundColor: "rgba(200,245,58,0.08)",
              borderBottomWidth: 1,
              borderBottomColor: "#1a1a1a",
            }}
          />
        </View>

        <View className="px-4">
          <View style={{ marginTop: -40, marginBottom: 10 }}>
            <View
              style={{
                padding: 3,
                backgroundColor: "#080808",
                borderRadius: 44,
                alignSelf: "flex-start",
              }}
            >
              <Avatar user={profile} size={80} />
            </View>
          </View>

          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{profile.name}</Text>
              <Text className="text-[#555] text-[13px]">{handleFrom(profile)}</Text>
            </View>
            {isOwn ? (
              <Pressable
                onPress={() => navigation.navigate("EditProfile")}
                className="rounded-full px-5 py-2 bg-surface2 border border-[#333]"
              >
                <Text className="text-white text-sm font-semibold">
                  Editar perfil
                </Text>
              </Pressable>
            ) : (
              <View style={{ width: 130 }}>
                <Button
                  label={following ? "Seguindo" : "Seguir"}
                  variant={following ? "outline" : "accent"}
                  onPress={onToggleFollow}
                  disabled={followBusy}
                />
              </View>
            )}
          </View>

          {profile.bio ? (
            <Text className="text-[#ccc] text-sm leading-6 mt-3">{profile.bio}</Text>
          ) : null}
          {profile.goal ? (
            <View className="flex-row mt-2">
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: "rgba(200,245,58,0.12)" }}
              >
                <Text className="text-accent text-xs font-semibold">
                  {profile.goal}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="flex-row gap-6 mt-4 pb-4 border-b border-[#1a1a1a]">
            {stats.map(([v, l]) => (
              <View key={l}>
                <Text className="text-white font-bold text-base">{v}</Text>
                <Text className="text-[#555] text-xs">{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Abas */}
        <View className="flex-row border-b border-[#1a1a1a]">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => selectTab(t.key)}
                className="flex-1 items-center py-3"
                style={
                  active
                    ? { borderBottomWidth: 2, borderBottomColor: colors.accent }
                    : null
                }
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: active ? "#fff" : "#555" }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {renderTabContent()}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
