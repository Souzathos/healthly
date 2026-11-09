import React, { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { Icon } from "./Icon";
import { colors } from "../theme/colors";
import { cn } from "../lib/utils";

export const Input = ({ label, password, leftIcon, className, ...rest }) => {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  return (
    <View className="w-full">
      {label ? <Text className="text-muted text-[13px] mb-1.5">{label}</Text> : null}
      <View
        className={cn(
          "rounded-2xl bg-surface2 flex-row items-center border-[1.5px]",
          focused ? "border-accent" : "border-inputBorder"
        )}
      >
        {leftIcon ? (
          <View className="pl-4">
            <Icon name={leftIcon} size="md" color={colors.mutedDark} />
          </View>
        ) : null}
        <TextInput
          placeholderTextColor={colors.mutedDark}
          secureTextEntry={password && !show}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "flex-1 min-w-0 px-4 py-3.5 text-white text-base",
            leftIcon && "pl-3",
            Platform.select({ web: "outline-none" }),
            className
          )}
          {...rest}
        />
        {password ? (
          <Pressable
            onPress={() => setShow((s) => !s)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={show ? "Ocultar senha" : "Mostrar senha"}
            className="w-11 h-11 items-center justify-center mr-1"
          >
            <Icon name={show ? "eyeOff" : "eye"} size="md" color={colors.mutedDark} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};
