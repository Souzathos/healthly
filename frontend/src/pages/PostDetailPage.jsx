import React, { useCallback, useRef, useState } from "react";
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
import { deletePost, getPost } from "../services/posts";
import { toggleCommentLike, togglePostLike } from "../services/likes";
import { toggleSaved } from "../services/saved";
import { listComments, createComment, deleteComment } from "../services/comments";
import { apiError, mediaUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { confirmAction, notify } from "../utils/alerts";
import { colors } from "../theme/colors";
import { formatCount, timeAgo, handleFrom } from "../utils/format";

export const PostDetailPage = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user: me } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [busyLike, setBusyLike] = useState(false);
  const [busySave, setBusySave] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [busyComments, setBusyComments] = useState(new Set());
  const inputRef = useRef(null);

  const isOwnPost = !!post?.user && post.user.id === me?.id;

  const load = useCallback(async () => {
    setError(false);
    try {
      const [p, c] = await Promise.all([getPost(postId), listComments(postId)]);
      setPost(p);
      setLiked(!!p.likedByMe);
      setLikesCount(p.likesCount || 0);
      setSaved(!!p.savedByMe);
      setComments(c);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openProfile = (user) => {
    if (user) navigation.push("UserProfile", { userId: user.id });
  };

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
    } catch (e) {
      notify("Não foi possível comentar", apiError(e));
    } finally {
      setSending(false);
    }
  };

  // Evita dois toques seguidos no mesmo comentário enquanto a requisição anterior corre
  const withCommentBusy = async (commentId, action) => {
    if (busyComments.has(commentId)) return;
    setBusyComments((ids) => new Set(ids).add(commentId));
    try {
      await action();
    } finally {
      setBusyComments((ids) => {
        const next = new Set(ids);
        next.delete(commentId);
        return next;
      });
    }
  };

  const onToggleCommentLike = (comment) =>
    withCommentBusy(comment.id, async () => {
      const update = (likedByMe, delta) =>
        setComments((list) =>
          list.map((c) =>
            c.id === comment.id
              ? { ...c, likedByMe, likesCount: c.likesCount + delta }
              : c
          )
        );

      const prev = comment.likedByMe;
      update(!prev, prev ? -1 : 1);
      try {
        await toggleCommentLike(comment.id);
      } catch {
        update(prev, prev ? 1 : -1);
      }
    });

  const onDeleteComment = (comment) =>
    confirmAction("Excluir comentário", "Deseja excluir este comentário?", () =>
      withCommentBusy(comment.id, async () => {
        try {
          await deleteComment(comment.id);
          setComments((list) => list.filter((c) => c.id !== comment.id));
        } catch (e) {
          notify("Não foi possível excluir", apiError(e));
        }
      }),
      "Excluir"
    );

  const onDeletePost = () =>
    confirmAction(
      "Excluir post",
      "Esta ação é permanente. Deseja continuar?",
      async () => {
        try {
          await deletePost(postId);
          navigation.goBack();
        } catch (e) {
          notify("Não foi possível excluir", apiError(e));
        }
      },
      "Excluir"
    );

  const actions = [
    {
      icon: "comment",
      color: colors.muted,
      onPress: () => inputRef.current?.focus(),
    },
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

  const renderBody = () => {
    if (error && !post) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="x" size={40} color="#333" />
          <Text className="text-muted mt-3 text-center">
            Não foi possível carregar o post. Ele pode ter sido excluído.
          </Text>
          <Pressable
            onPress={() => {
              setLoading(true);
              load();
            }}
            className="mt-4 px-5 py-2.5 rounded-full border border-accent"
          >
            <Text className="text-accent font-semibold text-sm">Tentar de novo</Text>
          </Pressable>
        </View>
      );
    }

    if (loading || !post) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="p-4">
            <View className="flex-row gap-3 mb-3">
              <Avatar user={post.user} size={46} onPress={() => openProfile(post.user)} />
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
                  <Avatar user={c.user} size={36} onPress={() => openProfile(c.user)} />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Pressable onPress={() => openProfile(c.user)}>
                        <Text className="text-white font-semibold text-sm">
                          {c.user?.name || "Usuário"}
                        </Text>
                      </Pressable>
                      <Text className="text-[#555] text-xs">
                        {c.user ? handleFrom(c.user) : ""} · {timeAgo(c.createdAt)}
                      </Text>
                    </View>
                    <Text className="text-[#e0e0e0] text-sm leading-6 mt-0.5">
                      {c.text}
                    </Text>
                  </View>
                  <View className="items-center gap-2">
                    <Pressable
                      onPress={() => onToggleCommentLike(c)}
                      className="items-center"
                    >
                      <Icon
                        name={c.likedByMe ? "heartFill" : "heart"}
                        size={16}
                        color={c.likedByMe ? colors.danger : colors.muted}
                      />
                      {c.likesCount > 0 ? (
                        <Text className="text-[#555] text-[11px] mt-0.5">
                          {formatCount(c.likesCount)}
                        </Text>
                      ) : null}
                    </Pressable>
                    {c.user?.id === me?.id ? (
                      <Pressable onPress={() => onDeleteComment(c)}>
                        <Icon name="trash" size={16} color={colors.muted} />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Campo de novo comentário */}
        <View className="flex-row items-center gap-2 px-4 py-2.5 border-t border-[#1a1a1a] bg-dark">
          <TextInput
            ref={inputRef}
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
              backgroundColor: commentText.trim() ? colors.accent : "#1a1a1a",
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
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-4 pb-3 flex-row items-center justify-between border-b border-[#1a1a1a]">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="back" size={24} color="#fff" />
          </Pressable>
          <Text className="text-white font-semibold text-base">Post</Text>
        </View>
        {isOwnPost ? (
          <Pressable onPress={onDeletePost}>
            <Icon name="trash" size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {renderBody()}
    </SafeAreaView>
  );
};
