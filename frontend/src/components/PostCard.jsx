import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Avatar } from "./Avatar";
import { PostActions } from "./PostActions";
import { UserName } from "./UserName";
import { useNavigation } from "@react-navigation/native";
import { DIETS } from "../utils/diets";
import { Badge } from "./ui/badge";
import { Text as BadgeText } from "./ui/text";
import { mediaUrl } from "../services/api";
import { togglePostLike } from "../services/likes";
import { toggleSaved } from "../services/saved";
import { toggleRepost } from "../services/posts";
import { timeAgo, handleFrom } from "../utils/format";
import { colors } from "../theme/colors";

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
}) => {
  const [liked, setLiked] = useState(!!post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [saved, setSaved] = useState(!!post.savedByMe);
  const [busyLike, setBusyLike] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [reposted, setReposted] = useState(!!post.repostedByMe);
  const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0);
  const [busyRepost, setBusyRepost] = useState(false);

  // O mesmo post pode mudar em outra tela (ex.: curtido no detalhe)
  useEffect(() => {
    setLiked(!!post.likedByMe);
    setLikesCount(post.likesCount || 0);
    setSaved(!!post.savedByMe);
    setReposted(!!post.repostedByMe);
    setRepostsCount(post.repostsCount || 0);
  }, [post.likedByMe, post.likesCount, post.savedByMe, post.repostedByMe, post.repostsCount]);

  const onToggleRepost = async () => {
    if (busyRepost) return;
    const prev = reposted;
    setBusyRepost(true);
    setReposted(!prev);
    setRepostsCount((c) => c + (prev ? -1 : 1));
    try {
      await toggleRepost(post.id);
    } catch {
      setReposted(prev);
      setRepostsCount((c) => c + (prev ? 1 : -1));
    } finally {
      setBusyRepost(false);
    }
  };

  const navigation = useNavigation();
  const tags = extractTags(post.description);
  const firstImage = post.images?.[0];

  const onToggleLike = async () => {
    if (busyLike) return;
    const prev = liked;
    setBusyLike(true);
    setLiked(!prev);
    setLikesCount((c) => c + (prev ? -1 : 1));
    try {
      await togglePostLike(post.id);
    } catch (e) {
      setLiked(prev);
      setLikesCount((c) => c + (prev ? 1 : -1));
    } finally {
      setBusyLike(false);
    }
  };

  const onToggleSave = async () => {
    if (busySave) return;
    const prev = saved;
    setBusySave(true);
    setSaved(!prev);
    try {
      await toggleSaved(post.id);
    } catch (e) {
      setSaved(prev);
    } finally {
      setBusySave(false);
    }
  };

  return (
    <View className="px-4 py-4 border-b border-divider">
      <View className="flex-row gap-3">
        <Avatar user={post.user} size={44} onPress={onPressUser} />

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-1.5 flex-1">
              <Pressable onPress={onPressUser} className="shrink">
                <UserName user={post.user} />
              </Pressable>
              <Text className="text-mutedDark text-[13px]" numberOfLines={1}>
                {post.user ? handleFrom(post.user) : ""}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-mutedDark text-xs">{timeAgo(post.createdAt)}</Text>
            </View>
          </View>

          {post.description ? (
            <Pressable onPress={onPressPost}>
              <Text className="text-soft text-sm leading-6">
                {post.description}
              </Text>
            </Pressable>
          ) : null}

          {tags.length > 0 || post.diet ? (
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              {post.diet && DIETS[post.diet] ? (
                <Badge className="bg-surface2 border border-line">
                  <BadgeText className="text-soft">{DIETS[post.diet]}</BadgeText>
                </Badge>
              ) : null}
              {tags.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => navigation.push("Hashtag", { tag: t.slice(1).toLowerCase() })}
                  accessibilityRole="link"
                  hitSlop={4}
                >
                  <Badge>
                    <BadgeText>{t}</BadgeText>
                  </Badge>
                </Pressable>
              ))}
            </View>
          ) : null}

          {firstImage ? (
            <Pressable onPress={onPressPost} className="mt-3">
              <Image
                source={{ uri: mediaUrl(firstImage.id) }}
                className="w-full rounded-2xl"
                style={{ height: 220, backgroundColor: colors.divider }}
                resizeMode="cover"
              />
            </Pressable>
          ) : null}

          <View className="mt-1">
            <PostActions
              liked={liked}
              saved={saved}
              reposted={reposted}
              repostsCount={repostsCount}
              onRepost={onToggleRepost}
              likesCount={likesCount}
              commentsCount={post.commentsCount || 0}
              onComment={onPressPost}
              onLike={onToggleLike}
              onSave={onToggleSave}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
