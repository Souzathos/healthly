import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { getPost } from "../services/posts";
import { mediaUrl } from "../services/api";
import { colors } from "../theme/colors";
import { formatCount, timeAgo, handleFrom } from "../utils/format";

export const PostDetailPage = ({ route, navigation }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setPost(await getPost(postId));
        } finally {
          setLoading(false);
        }
      })();
    }, [postId])
  );

  const actions = [
    { icon: "comment", color: colors.muted },
    { icon: "repeat", color: colors.muted },
    {
      icon: liked ? "heartFill" : "heart",
      color: liked ? colors.danger : colors.muted,
      onPress: () => setLiked((l) => !l),
    },
    { icon: "bookmark", color: colors.muted },
    { icon: "share", color: colors.muted },
  ];

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-4 pb-3 flex-row items-center gap-3 border-b border-[#1a1a1a]">
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color="#fff" />
        </Pressable>
        <Text className="text-white font-semibold text-base">Post</Text>
      </View>

      {loading || !post ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-4">
            <View className="flex-row gap-3 mb-3">
              <Avatar
                user={post.user}
                size={46}
                onPress={() =>
                  post.user &&
                  navigation.navigate("UserProfile", { userId: post.user.id })
                }
              />
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-white font-semibold text-[15px]">
                    {post.user?.name}
                  </Text>
                </View>
                <Text className="text-[#555] text-[13px]">
                  {post.user ? handleFrom(post.user) : ""} · {timeAgo(post.createdAt)}
                </Text>
              </View>
            </View>

            {post.description ? (
              <Text className="text-[#e0e0e0] text-base leading-7 mb-3">
                {post.description}
              </Text>
            ) : null}

            {post.images?.map((img) => (
              <Image
                key={img.id}
                source={{ uri: mediaUrl(img.id) }}
                className="w-full rounded-2xl mb-3"
                style={{ height: 260, backgroundColor: "#1a1a1a" }}
                resizeMode="cover"
              />
            ))}

            <View className="flex-row gap-5 py-3 border-t border-b border-[#1a1a1a]">
              <Text className="text-muted text-[13px]">
                <Text className="text-white font-bold">
                  {formatCount(post.likesCount)}
                </Text>{" "}
                Curtidas
              </Text>
              <Text className="text-muted text-[13px]">
                <Text className="text-white font-bold">
                  {formatCount(post.commentsCount)}
                </Text>{" "}
                Comentários
              </Text>
            </View>

            <View className="flex-row mt-1">
              {actions.map((a, i) => (
                <Pressable
                  key={i}
                  onPress={a.onPress}
                  className="flex-1 items-center py-2.5"
                >
                  <Icon name={a.icon} size={20} color={a.color} />
                </Pressable>
              ))}
            </View>
          </View>

          <View className="items-center px-8 py-10 border-t-4 border-[#111]">
            <Icon name="comment" size={36} color="#333" />
            <Text className="text-muted mt-3 text-center text-[13px]">
              Comentários chegam em breve nesta versão.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
