import React, { useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import { mediaUrl } from "../services/api";
import { colors } from "../theme/colors";
import { formatCount, timeAgo, handleFrom } from "../utils/format";

// Extrai #hashtags da descrição para exibir como tags (o backend não tem campo tags)
function extractTags(text) {
  if (!text) return [];
  const matches = text.match(/#[\wÀ-ÿ]+/g);
  return matches ? Array.from(new Set(matches)).slice(0, 4) : [];
}

export const PostCard = ({
  post,
  onPressUser,
  onPressPost,
  showThreadLine = true,
}) => {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const tags = extractTags(post.description);
  const firstImage = post.images?.[0];

  const actions = [
    {
      key: "comment",
      icon: "comment",
      label: formatCount(post.commentsCount),
      color: colors.muted,
      onPress: onPressPost,
    },
    {
      key: "repost",
      icon: "repeat",
      label: formatCount(reposted ? 1 : 0),
      color: reposted ? colors.accent2 : colors.muted,
      onPress: () => setReposted((r) => !r),
    },
    {
      key: "like",
      icon: liked ? "heartFill" : "heart",
      label: formatCount(post.likesCount + (liked ? 1 : 0)),
      color: liked ? colors.danger : colors.muted,
      onPress: () => setLiked((l) => !l),
    },
  ];

  return (
    <View className="px-4 py-4 border-b border-[#1a1a1a]">
      <View className="flex-row gap-3">
        <View className="items-center">
          <Avatar user={post.user} size={44} onPress={onPressUser} />
          {showThreadLine ? (
            <View className="flex-1 w-[1.5px] bg-line mt-2 min-h-[16px]" />
          ) : null}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-1.5 flex-1">
              <Pressable onPress={onPressUser}>
                <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                  {post.user?.name || "Usuário"}
                </Text>
              </Pressable>
              <Text className="text-[#555] text-[13px]" numberOfLines={1}>
                {post.user ? handleFrom(post.user) : ""}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-[#555] text-xs">{timeAgo(post.createdAt)}</Text>
            </View>
          </View>

          {post.description ? (
            <Pressable onPress={onPressPost}>
              <Text className="text-[#e0e0e0] text-sm leading-6">
                {post.description}
              </Text>
            </Pressable>
          ) : null}

          {tags.length > 0 ? (
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <View
                  key={t}
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: "rgba(200,245,58,0.12)" }}
                >
                  <Text className="text-accent text-xs font-semibold">{t}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {firstImage ? (
            <Pressable onPress={onPressPost} className="mt-3">
              <Image
                source={{ uri: mediaUrl(firstImage.id) }}
                className="w-full rounded-2xl"
                style={{ height: 220, backgroundColor: "#1a1a1a" }}
                resizeMode="cover"
              />
            </Pressable>
          ) : null}

          <View className="flex-row mt-3 -ml-2">
            {actions.map((a) => (
              <Pressable
                key={a.key}
                onPress={a.onPress}
                className="flex-row items-center gap-1.5 px-2.5 py-1.5"
              >
                <Icon name={a.icon} size={18} color={a.color} />
                <Text style={{ color: a.color, fontSize: 13 }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
