import React from "react";
import { Text, View } from "react-native";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { colors } from "../theme/colors";

// Lista vazia ou erro de carregamento. Com onRetry, mostra "Tentar de novo".
export const EmptyState = ({ icon, message, onRetry, className = "py-16" }) => (
  <View className={`items-center px-8 ${className}`}>
    <Icon name={icon} size="xl" color={colors.faint} />
    <Text className="text-muted mt-3 text-center text-sm leading-5">{message}</Text>
    {onRetry ? (
      <Button
        label="Tentar de novo"
        variant="outline"
        size="sm"
        onPress={onRetry}
        className="mt-4"
      />
    ) : null}
  </View>
);
