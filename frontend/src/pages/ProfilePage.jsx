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
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { IconButton } from "../components/IconButton";
import { ScreenHeader } from "../components/ScreenHeader";
import { TabStrip } from "../components/TabStrip";
import { Badge } from "../components/ui/badge";
import { Text as BadgeText } from "../components/ui/text";
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
    <ScreenHeader
      title={profile ? handleFrom(profile) : ""}
      border={false}
      onBack={isOwn ? undefined : () => navigation.goBack()}
      right={
        isOwn ? (
          <IconButton name="logout" label="Sair" onPress={signOut} />
        ) : undefined
      }
    />
  );

  if (error && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
        {header}
        <View className="flex-1 justify-center">
          <EmptyState
            icon="user"
            message="Não foi possível carregar o perfil."
            onRetry={() => loadProfile(true)}
          />
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
      className="px-4 py-4 border-b border-divider"
    >
      {tab !== "posts" ? (
        <View className="flex-row items-center gap-2 mb-1.5">
          <Avatar user={post.user} size={22} />
          <Text className="text-white text-xs font-semibold">
            {post.user?.name}
          </Text>
          <Text className="text-mutedDark text-xs">
            {post.user ? handleFrom(post.user) : ""}
          </Text>
        </View>
      ) : null}
      {post.description ? (
        <Text className="text-soft text-sm leading-6">
          {post.description}
        </Text>
      ) : null}
      {post.images?.[0] ? (
        <Image
          source={{ uri: mediaUrl(post.images[0].id) }}
          className="w-full rounded-2xl mt-3"
          style={{ height: 180, backgroundColor: colors.divider }}
          resizeMode="cover"
        />
      ) : null}
      <View className="flex-row gap-5 mt-2.5">
        <Text className="text-mutedDark text-xs">
          <Text className="text-white font-semibold">
            {formatCount(post.likesCount)}
          </Text>{" "}
          {post.likesCount === 1 ? "curtida" : "curtidas"}
        </Text>
        <Text className="text-mutedDark text-xs">
          <Text className="text-white font-semibold">
            {formatCount(post.commentsCount)}
          </Text>{" "}
          {post.commentsCount === 1 ? "resposta" : "respostas"}
        </Text>
        <Text className="text-mutedDark text-xs">{timeAgo(post.createdAt)}</Text>
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
        <EmptyState
          icon="x"
          message="Não foi possível carregar esta aba."
          onRetry={() => loadTab(tab)}
        />
      );
    }
    if (currentList && currentList.length > 0) {
      return currentList.map(renderPostRow);
    }
    return <EmptyState icon="grid" message={emptyLabel} />;
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
              borderBottomColor: colors.divider,
            }}
          />
        </View>

        <View className="px-4">
          <View style={{ marginTop: -40, marginBottom: 10 }}>
            <View
              style={{
                padding: 3,
                backgroundColor: colors.dark,
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
              <Text className="text-mutedDark text-[13px]">{handleFrom(profile)}</Text>
            </View>
            {isOwn ? (
              <Button
                label="Editar perfil"
                variant="ghost"
                size="sm"
                onPress={() => navigation.navigate("EditProfile")}
              />
            ) : (
              <Button
                label={following ? "Seguindo" : "Seguir"}
                variant={following ? "ghost" : "accent"}
                size="sm"
                onPress={onToggleFollow}
                disabled={followBusy}
              />
            )}
          </View>

          {profile.bio ? (
            <Text className="text-soft text-sm leading-6 mt-3">{profile.bio}</Text>
          ) : null}
          {profile.goal ? (
            <View className="flex-row mt-2">
              <Badge>
                <BadgeText>{profile.goal}</BadgeText>
              </Badge>
            </View>
          ) : null}

          <View className="flex-row gap-6 mt-4 pb-4 border-b border-divider">
            {stats.map(([v, l]) => (
              <View key={l}>
                <Text className="text-white font-bold text-base">{v}</Text>
                <Text className="text-mutedDark text-xs">{l}</Text>
              </View>
            ))}
          </View>
        </View>

        <TabStrip tabs={tabs} value={tab} onChange={selectTab} />

        {renderTabContent()}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
