import React from "react";
import { ActivityIndicator } from "react-native";
import { Button as UIButton } from "./ui/button";
import { Text } from "./ui/text";
import { colors } from "../theme/colors";

export const Button = ({
  label,
  onPress,
  variant = "accent",
  size = "lg",
  loading,
  disabled,
  className,
}) => (
  <UIButton
    onPress={onPress}
    variant={variant}
    size={size}
    disabled={disabled || loading}
    className={className}
  >
    {loading ? (
      <ActivityIndicator color={variant === "accent" ? colors.dark : colors.accent} />
    ) : (
      <Text>{label}</Text>
    )}
  </UIButton>
);
