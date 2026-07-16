import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { colors } from "../theme/colors";

// Tela apenas visual/mock (notificações reais fora do escopo desta entrega).
const NOTIFS = [
  { name: "Carlos Treino", action: "seguiu você", time: "2m", icon: "user", color: colors.accent },
  { name: "Julia Saúde", action: "curtiu seu post", time: "5m", icon: "heartFill", color: colors.danger },
  { name: "Pedro Nutrição", action: "repostou seu post", time: "12m", icon: "repeat", color: colors.accent2 },
  { name: "Ana Fitness", action: "respondeu seu post", time: "1h", icon: "comment", color: "#5c8be0" },
  { name: "Maria Yoga", action: "começou a seguir você", time: "5h", icon: "user", color: colors.accent },
];

function MiniAvatar({ name }) {
  const ini = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.accent2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#080808", fontWeight: "700" }}>{ini}</Text>
    </View>
  );
}

export const NotificationsPage = () => (
  <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
    <View className="px-5 pt-1 pb-3 border-b border-[#1a1a1a]">
      <Text className="text-white text-xl font-bold">Notificações</Text>
    </View>
    <ScrollView className="flex-1">
      {NOTIFS.map((n, i) => (
        <View
          key={i}
          className="flex-row items-center gap-3 px-4 py-4 border-b border-[#1a1a1a]"
        >
          <View className="relative">
            <MiniAvatar name={n.name} />
            <View
              className="absolute -bottom-1 -right-1 items-center justify-center"
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#111",
                borderWidth: 2,
                borderColor: "#080808",
              }}
            >
              <Icon name={n.icon} size={12} color={n.color} />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm">
              <Text className="font-semibold">{n.name}</Text>{" "}
              <Text className="text-muted">{n.action}</Text>
            </Text>
          </View>
          <Text className="text-[#555] text-xs">{n.time}</Text>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);
