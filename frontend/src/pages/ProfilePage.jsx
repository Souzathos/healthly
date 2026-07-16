import React, { useCallback, useState } from "react";
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
import { getMe, getProfile } from "../services/users";
import { mediaUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { formatCount, handleFrom, timeAgo } from "../utils/format";

export const ProfilePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user: me, signOut } = useAuth();
  const paramUserId = route.params?.userId;
  const isOwn = !paramUserId || paramUserId === me?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          setProfile(isOwn ? await getMe() : await getProfile(paramUserId));
        } finally {
          setLoading(false);
        }
      })();
    }, [isOwn, paramUserId])
  );

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

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pb-2 flex-row items-center justify-between">
        {isOwn ? (
          <View style={{ width: 24 }} />
        ) : (
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="back" size={24} color="#fff" />
          </Pressable>
        )}
        <Text className="text-white font-semibold text-base">
          {handleFrom(profile)}
        </Text>
        {isOwn ? (
          <Pressable onPress={signOut}>
            <Icon name="logout" size={22} color="#fff" />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

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
                  onPress={() => setFollowing((f) => !f)}
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

        {/* Posts do usuário */}
        {profile.posts.length > 0 ? (
          profile.posts.map((post) => (
            <Pressable
              key={post.id}
              onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
              className="px-4 py-4 border-b border-[#1a1a1a]"
            >
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
          ))
        ) : (
          <View className="items-center py-16">
            <Icon name="grid" size={40} color="#333" />
            <Text className="text-muted mt-3">Nenhum post ainda</Text>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
