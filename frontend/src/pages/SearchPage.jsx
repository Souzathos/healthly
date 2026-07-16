import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../components/Input";
import { Icon } from "../components/Icon";
import { colors } from "../theme/colors";

// Tela apenas visual/mock (busca real fora do escopo desta entrega).
const TRENDING = ["#lowcarb", "#treino", "#hiit", "#receitas", "#yoga", "#proteina"];
const SUGGESTED = [
  { name: "Ana Fitness", handle: "@anafitness", followers: "12.4k" },
  { name: "Carlos Treino", handle: "@carlostreino", followers: "8.9k" },
  { name: "Julia Saúde", handle: "@juliasaude", followers: "5.2k" },
  { name: "Pedro Nutrição", handle: "@pedronut", followers: "3.1k" },
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
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#080808", fontWeight: "700" }}>{ini}</Text>
    </View>
  );
}

export const SearchPage = () => {
  const [q, setQ] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <View className="px-4 pt-1 pb-3">
        <View className="relative justify-center">
          <View className="absolute left-4 z-10">
            <Icon name="search" size={18} color="#555" />
          </View>
          <Input
            placeholder="Buscar pessoas, treinos, dietas..."
            value={q}
            onChangeText={setQ}
            style={{ paddingLeft: 42 }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        <Text className="text-white text-[15px] font-semibold mb-3">🔥 Trending</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {TRENDING.map((t) => (
            <Pressable
              key={t}
              className="rounded-full px-3.5 py-2 bg-surface2 border border-line"
            >
              <Text className="text-accent text-[13px] font-semibold">{t}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-white text-[15px] font-semibold mb-3">
          Pessoas sugeridas
        </Text>
        {SUGGESTED.map((u) => (
          <View
            key={u.handle}
            className="flex-row items-center justify-between mb-4"
          >
            <View className="flex-row items-center gap-3">
              <MiniAvatar name={u.name} />
              <View>
                <Text className="text-white font-semibold text-sm">{u.name}</Text>
                <Text className="text-[#555] text-xs">
                  {u.handle} · {u.followers} seguidores
                </Text>
              </View>
            </View>
            <Pressable className="rounded-full px-4 py-2 bg-surface2 border border-accent">
              <Text className="text-accent text-[13px] font-semibold">Seguir</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
