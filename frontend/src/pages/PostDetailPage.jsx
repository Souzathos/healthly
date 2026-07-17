import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { getPost } from "../services/posts";
import { togglePostLike } from "../services/likes";
import { toggleSaved } from "../services/saved";
import { listComments, createComment } from "../services/comments";
import { mediaUrl } from "../services/api";
import { colors } from "../theme/colors";
import { formatCount, timeAgo, handleFrom } from "../utils/format";

export const PostDetailPage = ({ route, navigation }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [busyLike, setBusyLike] = useState(false);
  const [busySave, setBusySave] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const p = await getPost(postId);
          setPost(p);
          setLiked(!!p.likedByMe);
          setLikesCount(p.likesCount || 0);
          setSaved(!!p.savedByMe);
          setComments(await listComments(postId));
        } finally {
          setLoading(false);
        }
      })();
    }, [postId])
  );

  const onToggleLike = async () => {
    if (busyLike) return;
    const prev = liked;
    setBusyLike(true);
    setLiked(!prev);
    setLikesCount((c) => c + (prev ? -1 : 1));
    try {
      await togglePostLike(postId);
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
      await toggleSaved(postId);
    } catch (e) {
      setSaved(prev);
    } finally {
      setBusySave(false);
    }
  };

  const onSendComment = async () => {
    const text = commentText.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await createComment(postId, text);
      setCommentText("");
      setComments(await listComments(postId));
    } finally {
      setSending(false);
    }
  };

  const actions = [
    { icon: "comment", color: colors.muted },
    { icon: "repeat", color: colors.muted },
    {
      icon: liked ? "heartFill" : "heart",
      color: liked ? colors.danger : colors.muted,
      onPress: onToggleLike,
    },
    {
      icon: "bookmark",
      color: saved ? colors.accent : colors.muted,
      onPress: onToggleSave,
    },
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
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
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
                    {formatCount(likesCount)}
                  </Text>{" "}
                  Curtidas
                </Text>
                <Text className="text-muted text-[13px]">
                  <Text className="text-white font-bold">
                    {formatCount(comments.length)}
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

            {/* Comentários */}
            <View className="border-t-4 border-[#111]">
              {comments.length === 0 ? (
                <View className="items-center px-8 py-10">
                  <Icon name="comment" size={36} color="#333" />
                  <Text className="text-muted mt-3 text-center text-[13px]">
                    Nenhum comentário ainda. Seja o primeiro!
                  </Text>
                </View>
              ) : (
                comments.map((c) => (
                  <View
                    key={c.id}
                    className="px-4 py-3 border-b border-[#1a1a1a] flex-row gap-3"
                  >
                    <Avatar user={c.user} size={36} />
                    <View className="flex-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-white font-semibold text-sm">
                          {c.user?.name || "Usuário"}
                        </Text>
                        <Text className="text-[#555] text-xs">
                          {c.user ? handleFrom(c.user) : ""} · {timeAgo(c.createdAt)}
                        </Text>
                      </View>
                      <Text className="text-[#e0e0e0] text-sm leading-6 mt-0.5">
                        {c.text}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {/* Campo de novo comentário */}
          <View className="flex-row items-center gap-2 px-4 py-2.5 border-t border-[#1a1a1a] bg-dark">
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Escreva um comentário..."
              placeholderTextColor="#555"
              className="flex-1 text-white text-sm px-3 py-2 rounded-full bg-surface2"
              maxLength={500}
              multiline
            />
            <Pressable
              onPress={onSendComment}
              disabled={sending || !commentText.trim()}
              className="w-10 h-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: commentText.trim()
                  ? colors.accent
                  : "#1a1a1a",
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#080808" />
              ) : (
                <Icon
                  name="send"
                  size={18}
                  color={commentText.trim() ? "#080808" : "#555"}
                />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};
