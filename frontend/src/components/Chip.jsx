import React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "../lib/utils";

// Pílula selecionável, usada em filtros e escolhas de uma opção
export const Chip = ({ label, selected = false, onPress, className }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    className={cn(
      "min-h-[36px] px-3.5 rounded-full items-center justify-center border active:opacity-80",
      selected ? "bg-accentSoft border-accent" : "bg-surface2 border-line",
      className
    )}
  >
    <Text className={cn("text-[13px] font-semibold", selected ? "text-accent" : "text-muted")}>
      {label}
    </Text>
  </Pressable>
);
