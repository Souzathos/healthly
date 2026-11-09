import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Avatar } from "../components/Avatar";
import { searchUsers, toggleFollow } from "../services/users";
import { apiError } from "../services/api";
import { notify } from "../utils/alerts";
import { colors } from "../theme/colors";
import { handleFrom } from "../utils/format";

const DEBOUNCE_MS = 300;

export const SearchPage = () => {
  const navigation = useNavigation();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  // idle: nada digitado | loading | done | error
  const [status, setStatus] = useState("idle");
  const [busyIds, setBusyIds] = useState(new Set());

  // Só a última busca digitada pode atualizar a lista
  const requestRef = useRef(0);

  const runSearch = useCallback(async (term) => {
    const request = ++requestRef.current;
    try {
      const data = await searchUsers(term);
      if (request !== requestRef.current) return;
      setResults(data);
      setStatus("done");
    } catch {
      if (request === requestRef.current) setStatus("error");
    }
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      requestRef.current++;
      setResults([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const timer = setTimeout(() => runSearch(term), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q, runSearch]);

  // Ao voltar de um perfil, o estado de seguir pode ter mudado lá
  const latestQuery = useRef(q);
  latestQuery.current = q;
  useFocusEffect(
    useCallback(() => {
      const term = latestQuery.current.trim();
      if (term) runSearch(term);
    }, [runSearch])
  );

  const onToggleFollow = async (user) => {
    if (busyIds.has(user.id)) return;
    const setFollowing = (value) =>
      setResults((list) =>
        list.map((u) => (u.id === user.id ? { ...u, isFollowing: value } : u))
      );

    setBusyIds((ids) => new Set(ids).add(user.id));
    setFollowing(!user.isFollowing);
    try {
      const res = await toggleFollow(user.id);
      setFollowing(res.following);
    } catch (e) {
      setFollowing(user.isFollowing);
      notify("Não foi possível seguir", apiError(e));
    } finally {
      setBusyIds((ids) => {
        const next = new Set(ids);
        next.delete(user.id);
        return next;
      });
    }
  };

  const renderEmpty = () => {
    if (status === "loading") {
      return (
        <View className="py-16 items-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    if (status === "error") {
      return (
        <EmptyState
          icon="x"
          message="Não foi possível buscar agora."
          onRetry={() => runSearch(q.trim())}
        />
      );
    }
    return (
      <EmptyState
        icon="search"
        message={
          status === "done"
            ? `Ninguém encontrado para "${q.trim()}".`
            : "Encontre pessoas pelo nome ou @usuário."
        }
      />
    );
  };

  const renderUser = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate("UserProfile", { userId: item.id })}
      className="flex-row items-center justify-between gap-3 px-4 py-3"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Avatar user={item} size={46} />
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-mutedDark text-xs" numberOfLines={1}>
            {handleFrom(item)}
            {item.goal ? ` · ${item.goal}` : ""}
          </Text>
        </View>
      </View>
      <Button
        label={item.isFollowing ? "Seguindo" : "Seguir"}
        variant={item.isFollowing ? "ghost" : "outline"}
        size="sm"
        onPress={() => onToggleFollow(item)}
        disabled={busyIds.has(item.id)}
      />
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-dark" edges={["top"]}>
      <View className="px-4 pt-1 pb-3">
        <Input
          placeholder="Buscar pessoas..."
          leftIcon="search"
          value={q}
          onChangeText={setQ}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={status === "done" ? results : []}
        keyExtractor={(u) => String(u.id)}
        renderItem={renderUser}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};
