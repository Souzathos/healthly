import React from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "./Icon";
import { colors } from "../theme/colors";
import { formatCount } from "../utils/format";

// Mesma linha de ações no card e no detalhe do post.
// -ml-2.5 cancela o px-2.5 do primeiro botão e alinha o ícone ao texto do post.
export const PostActions = ({
  liked,
  saved,
  likesCount,
  commentsCount,
  showCounts = true,
  onComment,
  onLike,
  onSave,
}) => {
  const actions = [
    {
      key: "comment",
      label: "Comentar",
      icon: "comment",
      color: colors.muted,
      count: commentsCount,
      onPress: onComment,
    },
    {
      key: "like",
      label: liked ? "Descurtir" : "Curtir",
      icon: liked ? "heartFill" : "heart",
      color: liked ? colors.danger : colors.muted,
      count: likesCount,
      onPress: onLike,
    },
    {
      key: "save",
      label: saved ? "Remover dos salvos" : "Salvar",
      icon: saved ? "bookmarkFill" : "bookmark",
      color: saved ? colors.accent : colors.muted,
      onPress: onSave,
    },
  ];

  return (
    <View className="flex-row items-center -ml-2.5">
      {actions.map((action) => (
        <Pressable
          key={action.key}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          className="flex-row items-center gap-1.5 h-11 min-w-11 px-2.5 active:opacity-70"
        >
          <Icon name={action.icon} size="md" color={action.color} />
          {showCounts && action.count !== undefined ? (
            <Text className="text-[13px]" style={{ color: action.color }}>
              {formatCount(action.count)}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
};
