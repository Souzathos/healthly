import React, { useCallback, useState } from "react";
import { View, Text, Image, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ScreenHeader } from "../components/ScreenHeader";
import { UserName } from "../components/UserName";
import { apiError } from "../services/api";
import { listPendingRequests, PROFESSIONAL_TYPES, reviewRequest } from "../services/professional";
import { notify } from "../utils/alerts";
import { colors } from "../theme/colors";
import { handleFrom, timeAgo } from "../utils/format";

export const AdminRequestsPage = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      setRequests(await listPendingRequests());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const review = async (request, approve) => {
    if (busyId) return;
    setBusyId(request.id);
    try {
      await reviewRequest(request.id, approve);
      setRequests((list) => list.filter((r) => r.id !== request.id));
    } catch (e) {
      notify("Não foi possível salvar", apiError(e));
    } finally {
      setBusyId(null);
    }
  };

  const renderItem = ({ item }) => {
    const info = PROFESSIONAL_TYPES[item.type];
    const busy = busyId === item.id;

    return (
      <View className="mx-4 my-2 rounded-2xl border border-line bg-surface p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <Avatar
            user={item.user}
            size={40}
            onPress={() => navigation.navigate("UserProfile", { userId: item.user.id })}
          />
          <View className="flex-1">
            <UserName user={item.user} />
            <Text className="text-mutedDark text-xs">
              {handleFrom(item.user)} · {timeAgo(item.createdAt)}
            </Text>
          </View>
        </View>

        <View>
          <Text className="text-white text-sm font-semibold">{info?.label}</Text>
          <Text className="text-muted text-[13px]">
            {info?.registry} {item.registryNumber}
          </Text>
        </View>

        <Image
          source={{ uri: item.document }}
          accessibilityLabel={`Registro profissional de ${item.user.name}`}
          className="w-full rounded-xl bg-divider"
          style={{ height: 220 }}
          resizeMode="contain"
        />

        <View className="flex-row gap-2">
          <Button
            label="Recusar"
            variant="ghost"
            size="sm"
            className="flex-1"
            disabled={busy}
            onPress={() => review(item, false)}
          />
          <Button
            label="Aprovar"
            size="sm"
            className="flex-1"
            loading={busy}
            onPress={() => review(item, true)}
          />
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View className="py-16 items-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    if (error) {
      return <EmptyState icon="x" message="Não foi possível carregar os pedidos." onRetry={load} />;
    }
    return <EmptyState icon="check" message="Nenhum pedido aguardando análise." />;
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScreenHeader title="Pedidos de verificação" onBack={() => navigation.goBack()} />
      <FlatList
        data={requests}
        keyExtractor={(r) => String(r.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.accent}
          />
        }
      />
    </SafeAreaView>
  );
};
