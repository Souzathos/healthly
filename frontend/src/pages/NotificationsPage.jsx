import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../components/EmptyState";
import { ScreenHeader } from "../components/ScreenHeader";

export const NotificationsPage = () => (
  <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
    <ScreenHeader title="Notificações" />
    <View className="flex-1">
      <EmptyState icon="bell" message="Nenhuma notificação por enquanto." />
    </View>
  </SafeAreaView>
);
