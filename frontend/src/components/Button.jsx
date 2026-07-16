import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";

export const Button = ({
  label,
  onPress,
  variant = "accent",
  loading,
  disabled,
}) => {
  const isDisabled = disabled || loading;

  const base = "w-full rounded-2xl py-4 items-center justify-center flex-row";
  const styles = {
    accent: "bg-accent",
    outline: "bg-transparent border-[1.5px] border-accent",
    ghost: "bg-surface2 border border-line",
  };
  const textStyles = {
    accent: "text-dark",
    outline: "text-accent",
    ghost: "text-white",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${base} ${styles[variant]} ${isDisabled ? "opacity-60" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "accent" ? "#080808" : "#c8f53a"} />
      ) : (
        <Text className={`font-bold text-base ${textStyles[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};
