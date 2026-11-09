import React from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { IconButton } from "./IconButton";
import { colors } from "../theme/colors";

// px-1.5 + os 10px internos do IconButton alinham o ícone aos 16px do conteúdo
export const ScreenHeader = ({ title, onBack, left, right, border = true }) => (
  <View
    className={`h-12 flex-row items-center justify-between px-1.5 ${
      border ? "border-b border-divider" : ""
    }`}
  >
    {/* O título fica fora do fluxo para continuar centralizado com laterais de larguras diferentes */}
    <View pointerEvents="none" className="absolute left-14 right-14 items-center">
      <Text className="text-white font-semibold text-base" numberOfLines={1}>
        {title}
      </Text>
    </View>

    {left ?? (onBack ? <IconButton name="back" label="Voltar" onPress={onBack} /> : <View className="w-11" />)}
    {right ?? <View className="w-11" />}
  </View>
);

// Ação de texto na lateral do cabeçalho, como "Salvar" ou "Publicar"
export const HeaderAction = ({ label, onPress, disabled, loading, muted }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    hitSlop={4}
    accessibilityRole="button"
    className={`h-11 min-w-11 px-2.5 items-center justify-center ${disabled ? "opacity-40" : ""}`}
  >
    {loading ? (
      <ActivityIndicator size="small" color={colors.accent} />
    ) : (
      <Text className={muted ? "text-muted text-sm" : "text-accent font-bold text-sm"}>{label}</Text>
    )}
  </Pressable>
);
