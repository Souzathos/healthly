import React from "react";
import { View, Text } from "react-native";
import { Icon } from "./Icon";
import { colors } from "../theme/colors";

// Faixa de erro inline para formulários (login, cadastro, etc.)
export const FormError = ({ message }) => {
  if (!message) return null;
  return (
    <View
      className="flex-row items-center gap-2 rounded-xl px-3 py-2.5"
      style={{
        backgroundColor: "rgba(224,92,92,0.12)",
        borderWidth: 1,
        borderColor: "rgba(224,92,92,0.4)",
      }}
    >
      <Icon name="x" size={16} color={colors.danger} />
      <Text style={{ color: colors.danger, fontSize: 13, flex: 1 }}>
        {message}
      </Text>
    </View>
  );
};
