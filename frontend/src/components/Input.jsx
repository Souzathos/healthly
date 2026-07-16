import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Icon } from "./Icon";
import { colors } from "../theme/colors";

export const Input = ({ label, password, style, ...rest }) => {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <View className="w-full">
      {label ? (
        <Text className="text-muted text-[13px] mb-1.5">{label}</Text>
      ) : null}
      <View
        className="rounded-2xl bg-surface2 flex-row items-center"
        style={{
          borderWidth: 1.5,
          borderColor: focused ? colors.accent : "#2a2a2a",
        }}
      >
        <TextInput
          placeholderTextColor={colors.mutedDark}
          secureTextEntry={password && !show}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 px-4 py-3.5 text-white text-base"
          style={[{ color: "#fff" }, style]}
          {...rest}
        />
        {password ? (
          <Pressable onPress={() => setShow((s) => !s)} className="px-4">
            <Icon name="eye" size={18} color={colors.mutedDark} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};
