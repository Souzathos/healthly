import React from "react";
import { Pressable } from "react-native";
import { Icon } from "./Icon";
import { colors } from "../theme/colors";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Text } from "./ui/text";

// Área de toque de 44x44: com size="lg", o ícone fica a 10px da borda da área
export const IconButton = ({
  name,
  label,
  size = "lg",
  color = colors.text,
  onPress,
  disabled,
  className,
  badge = 0,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    hitSlop={4}
    accessibilityRole="button"
    accessibilityLabel={badge ? `${label}, ${badge} não lidas` : label}
    className={cn(
      "w-11 h-11 items-center justify-center active:opacity-70",
      disabled && "opacity-50",
      className
    )}
  >
    <Icon name={name} size={size} color={color} />
    {badge ? (
      <Badge variant="count" className="absolute top-1 right-0">
        <Text>{badge > 99 ? "99+" : badge}</Text>
      </Badge>
    ) : null}
  </Pressable>
);
