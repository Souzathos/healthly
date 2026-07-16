import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Input } from "../components/Input";
import { Icon } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { FormError } from "../components/FormError";
import { useAuth } from "../context/AuthContext";
import { updateUser, deleteAccount } from "../services/users";
import { apiError } from "../services/api";
import { notify, confirmAction } from "../utils/alerts";
import { colors } from "../theme/colors";

export const EditProfilePage = () => {
  const navigation = useNavigation();
  const { user, setUser, signOut } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [handle, setHandle] = useState(user?.handle?.replace(/^@/, "") || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [goal, setGoal] = useState(user?.goal || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (name.trim().length < 3) {
      setError("O nome deve ter ao menos 3 caracteres.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUser({
        name: name.trim(),
        handle: handle.trim() || undefined,
        bio: bio.trim(),
        goal: goal.trim(),
        password: password || undefined,
      });
      setUser({ ...user, ...updated });
      notify("Pronto!", "Perfil atualizado com sucesso.");
      navigation.goBack();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    try {
      await deleteAccount();
      await signOut();
    } catch (e) {
      setError(apiError(e));
    }
  };

  const confirmDelete = () => {
    confirmAction(
      "Excluir conta",
      "Esta ação é permanente e apaga seus posts. Deseja continuar?",
      doDelete,
      "Excluir"
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-4 pb-3 flex-row items-center justify-between border-b border-[#1a1a1a]">
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color="#fff" />
        </Pressable>
        <Text className="text-white font-semibold text-base">Editar perfil</Text>
        <Pressable onPress={save} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text className="text-accent font-bold text-sm">Salvar</Text>
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <View className="items-center py-6">
          <Avatar user={{ ...user, name }} size={88} />
        </View>

        <View className="gap-4">
          <Input label="Nome completo" value={name} onChangeText={setName} />
          <Input
            label="@usuário"
            autoCapitalize="none"
            value={handle}
            onChangeText={setHandle}
            placeholder="seuusuario"
          />
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Fale um pouco sobre você"
            multiline
          />
          <Input
            label="Objetivo"
            value={goal}
            onChangeText={setGoal}
            placeholder="🥗 Perder peso"
          />
          <Input
            label="Nova senha (opcional)"
            password
            value={password}
            onChangeText={setPassword}
            placeholder="deixe em branco para manter"
          />
          <FormError message={error} />
        </View>

        <View className="mt-10 mb-8">
          <Text className="text-muted text-xs mb-3">Zona de perigo</Text>
          <Pressable
            onPress={confirmDelete}
            className="rounded-2xl py-4 flex-row items-center justify-center gap-2 border"
            style={{ borderColor: colors.danger }}
          >
            <Icon name="trash" size={18} color={colors.danger} />
            <Text className="font-semibold" style={{ color: colors.danger }}>
              Excluir minha conta
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
