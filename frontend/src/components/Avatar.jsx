import React from "react";
import { View, Text, Pressable } from "react-native";
import { colorFromId, initials } from "../utils/format";
import { colors } from "../theme/colors";

export const Avatar = ({ user, size = 44, onPress }) => {
  const bg = colorFromId(user?.id, user?.name || undefined);
  const inner = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: colors.dark,
          fontWeight: "700",
          fontSize: size * 0.35,
        }}
      >
        {initials(user?.name)}
      </Text>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{inner}</Pressable>;
  }
  return inner;
};
