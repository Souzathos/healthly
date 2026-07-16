import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Icon } from "./Icon";
import { colorFromId, initials } from "../utils/format";

// Stories apenas visuais (mock) — sem viewer funcional, conforme escopo.
const MOCK = [
  { id: 1, name: "Ana", seen: false },
  { id: 2, name: "Carlos", seen: false },
  { id: 3, name: "Julia", seen: true },
  { id: 4, name: "Pedro", seen: false },
  { id: 5, name: "Maria", seen: true },
];

export const StoryRow = ({ onAdd }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
    className="py-3"
  >
    <Pressable className="items-center gap-1.5" onPress={onAdd}>
      <View
        className="items-center justify-center bg-surface2"
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          borderWidth: 2,
          borderColor: "#333",
          borderStyle: "dashed",
        }}
      >
        <Icon name="plus" size={22} color="#555" />
      </View>
      <Text className="text-[#555] text-[11px]">Seu story</Text>
    </Pressable>

    {MOCK.map((s) => (
      <View key={s.id} className="items-center gap-1.5">
        <View
          style={{
            borderRadius: 32,
            padding: 2,
            backgroundColor: s.seen ? "#333" : "#c8f53a",
          }}
        >
          <View style={{ borderRadius: 30, padding: 2, backgroundColor: "#080808" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colorFromId(s.id, s.name),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#080808", fontWeight: "700" }}>
                {initials(s.name)}
              </Text>
            </View>
          </View>
        </View>
        <Text className="text-muted text-[11px]" numberOfLines={1}>
          {s.name}
        </Text>
      </View>
    ))}
  </ScrollView>
);
