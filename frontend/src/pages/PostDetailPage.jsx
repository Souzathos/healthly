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
import { useConfirm } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { PostActions } from "../components/PostActions";
import { ScreenHeader } from "../components/ScreenHeader";
import { UserName } from "../components/UserName";
import { deletePost, getPost, toggleRepost } from "../services/posts";
import { toggleCommentLike, togglePostLike } from "../services/likes";
import { toggleSaved } from "../services/saved";
import { listComments, createComment, deleteComment } from "../services/comments";
import { apiError, mediaUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { notify } from "../utils/alerts";
import { colors } from "../theme/colors";
import { formatCount, timeAgo, handleFrom } from "../utils/format";

export const PostDetailPage = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user: me } = useAuth();
  const confirm = useConfirm();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [busyRepost, setBusyRepost] = useState(false);
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
      setReposted(!!p.repostedByMe);
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

  const onToggleRepost = async () => {
    if (busyRepost) return;
    const prev = reposted;
    setBusyRepost(true);
    setReposted(!prev);
    try {
      await toggleRepost(postId);
    } catch {
      setReposted(prev);
    } finally {
      setBusyRepost(false);
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
    confirm({
      title: "Excluir comentário",
      message: "Deseja excluir este comentário?",
      confirmLabel: "Excluir",
      onConfirm: () =>
        withCommentBusy(comment.id, async () => {
          try {
            await deleteComment(comment.id);
            setComments((list) => list.filter((c) => c.id !== comment.id));
          } catch (e) {
            notify("Não foi possível excluir", apiError(e));
          }
        }),
    });

  const onDeletePost = () =>
    confirm({
      title: "Excluir post",
      message: "Esta ação é permanente. Deseja continuar?",
      confirmLabel: "Excluir",
      onConfirm: async () => {
        try {
          await deletePost(postId);
          navigation.goBack();
        } catch (e) {
          notify("Não foi possível excluir", apiError(e));
        }
      },
    });

  const renderBody = () => {
    if (error && !post) {
      return (
        <View className="flex-1 justify-center">
          <EmptyState
            icon="x"
            message="Não foi possível carregar o post. Ele pode ter sido excluído."
            onRetry={() => {
              setLoading(true);
              load();
            }}
          />
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
                  <UserName user={post.user} className="text-[15px]" badgeSize={15} />
                </View>
                <Text className="text-mutedDark text-[13px]">
                  {post.user ? handleFrom(post.user) : ""} · {timeAgo(post.createdAt)}
                </Text>
              </View>
            </View>

            {post.description ? (
              <Text className="text-soft text-base leading-7 mb-3">
                {post.description}
              </Text>
            ) : null}

            {post.images?.map((img) => (
              <Image
                key={img.id}
                source={{ uri: mediaUrl(img.id) }}
                className="w-full rounded-2xl mb-3"
                style={{ height: 260, backgroundColor: colors.divider }}
                resizeMode="cover"
              />
            ))}

            <View className="flex-row gap-5 py-3 border-t border-b border-divider">
              <Text className="text-muted text-[13px]">
                <Text className="text-white font-bold">
                  {formatCount(likesCount)}
                </Text>{" "}
                {likesCount === 1 ? "Curtida" : "Curtidas"}
              </Text>
              <Text className="text-muted text-[13px]">
                <Text className="text-white font-bold">
                  {formatCount(comments.length)}
                </Text>{" "}
                {comments.length === 1 ? "Comentário" : "Comentários"}
              </Text>
            </View>

            <View className="mt-1">
              <PostActions
                liked={liked}
                saved={saved}
                reposted={reposted}
                showCounts={false}
                onComment={() => inputRef.current?.focus()}
                onRepost={onToggleRepost}
                onLike={onToggleLike}
                onSave={onToggleSave}
              />
            </View>
          </View>

          {/* Comentários */}
          <View className="border-t-4 border-surface">
            {comments.length === 0 ? (
              <EmptyState
                icon="comment"
                message="Nenhum comentário ainda. Seja o primeiro!"
                className="py-10"
              />
            ) : (
              comments.map((c) => (
                <View
                  key={c.id}
                  className="px-4 py-3 border-b border-divider flex-row gap-3"
                >
                  <Avatar user={c.user} size={36} onPress={() => openProfile(c.user)} />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Pressable onPress={() => openProfile(c.user)}>
                        <UserName user={c.user} />
                      </Pressable>
                      <Text className="text-mutedDark text-xs">
                        {c.user ? handleFrom(c.user) : ""} · {timeAgo(c.createdAt)}
                      </Text>
                    </View>
                    <Text className="text-soft text-sm leading-6 mt-0.5">
                      {c.text}
                    </Text>
                  </View>
                  <View className="items-center -mr-2.5 -mt-2.5">
                    <Pressable
                      onPress={() => onToggleCommentLike(c)}
                      accessibilityRole="button"
                      accessibilityLabel={c.likedByMe ? "Descurtir comentário" : "Curtir comentário"}
                      className="min-w-11 min-h-11 items-center justify-center"
                    >
                      <Icon
                        name={c.likedByMe ? "heartFill" : "heart"}
                        size="sm"
                        color={c.likedByMe ? colors.danger : colors.muted}
                      />
                      {c.likesCount > 0 ? (
                        <Text className="text-mutedDark text-[11px] mt-0.5">
                          {formatCount(c.likesCount)}
                        </Text>
                      ) : null}
                    </Pressable>
                    {c.user?.id === me?.id ? (
                      <IconButton
                        name="trash"
                        label="Excluir comentário"
                        size="sm"
                        color={colors.muted}
                        onPress={() => onDeleteComment(c)}
                      />
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Campo de novo comentário */}
        <View className="flex-row items-center gap-2 px-4 py-2.5 border-t border-divider bg-dark">
          <TextInput
            ref={inputRef}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Escreva um comentário..."
            placeholderTextColor={colors.mutedDark}
            className={`flex-1 text-white text-sm px-3 py-2 rounded-full bg-surface2 ${Platform.OS === "web" ? "outline-none" : ""}`}
            maxLength={500}
            multiline
          />
          <Pressable
            onPress={onSendComment}
            disabled={sending || !commentText.trim()}
            accessibilityRole="button"
            accessibilityLabel="Enviar comentário"
            className="w-10 h-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: commentText.trim() ? colors.accent : colors.divider,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.dark} />
            ) : (
              <Icon
                name="send"
                size="md"
                color={commentText.trim() ? colors.dark : colors.mutedDark}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScreenHeader
        title="Post"
        onBack={() => navigation.goBack()}
        right={
          isOwnPost ? (
            <IconButton
              name="trash"
              label="Excluir post"
              size="md"
              color={colors.muted}
              onPress={onDeletePost}
            />
          ) : undefined
        }
      />

      {renderBody()}
    </SafeAreaView>
  );
};
