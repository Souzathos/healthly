import React from "react";
import { View, Text } from "react-native";
import { Logo } from "../components/Logo";

export const SplashPage = () => (
  <View className="flex-1 bg-dark items-center justify-center">
    <View className="items-center gap-4">
      <Logo size={80} />
      <Text className="text-accent text-3xl font-bold">Healthly</Text>
      <Text className="text-[#555] text-sm">viva melhor, todo dia</Text>
    </View>
  </View>
);
