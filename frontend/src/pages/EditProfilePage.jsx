import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Button } from "../components/Button";
import { useConfirm } from "../components/ConfirmDialog";
import { Input } from "../components/Input";
import { HeaderAction, ScreenHeader } from "../components/ScreenHeader";
import { Avatar } from "../components/Avatar";
import { FormError } from "../components/FormError";
import { useAuth } from "../context/AuthContext";
import { updateUser, deleteAccount } from "../services/users";
import { apiError } from "../services/api";
import { notify } from "../utils/alerts";

export const EditProfilePage = () => {
  const navigation = useNavigation();
  const { user, setUser, signOut } = useAuth();
  const confirm = useConfirm();

  const [name, setName] = useState(user?.name || "");
  const [handle, setHandle] = useState(user?.handle?.replace(/^@/, "") || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [goal, setGoal] = useState(user?.goal || "");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (name.trim().length < 3) {
      setError("O nome deve ter ao menos 3 caracteres.");
      return;
    }
    if (password && !currentPassword) {
      setError("Informe a senha atual para trocar a senha.");
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
        currentPassword: password ? currentPassword : undefined,
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
    confirm({
      title: "Excluir conta",
      message: "Esta ação é permanente e apaga seus posts. Deseja continuar?",
      confirmLabel: "Excluir",
      onConfirm: doDelete,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScreenHeader
        title="Editar perfil"
        onBack={() => navigation.goBack()}
        right={<HeaderAction label="Salvar" onPress={save} loading={saving} />}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
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
          {password.length > 0 && (
            <Input
              label="Senha atual"
              password
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          )}
          <FormError message={error} />
        </View>

        <View className="mt-10 mb-8">
          <Text className="text-muted text-xs mb-3">Zona de perigo</Text>
          <Button label="Excluir minha conta" variant="danger" onPress={confirmDelete} />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
