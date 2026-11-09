import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { FormError } from "../components/FormError";
import { Icon } from "../components/Icon";
import { Input } from "../components/Input";
import { ScreenHeader } from "../components/ScreenHeader";
import { apiError } from "../services/api";
import { getMyRequest, PROFESSIONAL_TYPES, requestVerification } from "../services/professional";
import { useAuth } from "../context/AuthContext";
import { notify } from "../utils/alerts";
import { colors } from "../theme/colors";

const STATUS = {
  pending: {
    icon: "eye",
    title: "Pedido em análise",
    text: "Um administrador vai conferir seu registro. O selo aparece no seu perfil assim que for aprovado.",
  },
  approved: {
    icon: "check",
    title: "Perfil verificado",
    text: "Seu selo de profissional já aparece no seu perfil e nos seus posts.",
  },
};

export const ProfessionalRequestPage = () => {
  const navigation = useNavigation();
  const { refreshUser } = useAuth();
  const [current, setCurrent] = useState(undefined);
  const [error, setError] = useState(false);

  const [type, setType] = useState("nutritionist");
  const [registryNumber, setRegistryNumber] = useState("");
  const [image, setImage] = useState(null);
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const { request } = await getMyRequest();
      setCurrent(request);
      if (request?.status === "approved") refreshUser();
    } catch {
      setError(true);
    }
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const pickDocument = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      notify("Permissão", "Precisamos de acesso às suas fotos para enviar o documento.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName || undefined });
    }
  };

  const submit = async () => {
    setFormError("");
    if (registryNumber.trim().length < 3) {
      setFormError(`Informe o número do seu ${PROFESSIONAL_TYPES[type].registry}.`);
      return;
    }
    if (!image) {
      setFormError("Envie uma foto do seu registro profissional.");
      return;
    }
    setSending(true);
    try {
      setCurrent(await requestVerification(type, registryNumber.trim(), image));
    } catch (e) {
      setFormError(apiError(e));
    } finally {
      setSending(false);
    }
  };

  const renderBody = () => {
    if (error) {
      return <EmptyState icon="x" message="Não foi possível carregar seu pedido." onRetry={load} />;
    }
    if (current === undefined) {
      return (
        <View className="py-16 items-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }

    const status = STATUS[current?.status];
    if (status) {
      return (
        <View className="items-center px-6 py-12 gap-3">
          <View className="w-16 h-16 rounded-full items-center justify-center bg-accentSoft">
            <Icon name={status.icon} size="lg" color={colors.accent} />
          </View>
          <Text className="text-white text-lg font-bold">{status.title}</Text>
          <Text className="text-muted text-sm text-center leading-5">{status.text}</Text>
          <Text className="text-mutedDark text-xs mt-2">
            {PROFESSIONAL_TYPES[current.type].registry} {current.registryNumber}
          </Text>
        </View>
      );
    }

    return (
      <View className="gap-5 py-6">
        {current?.status === "rejected" ? (
          <View className="rounded-2xl border border-danger/40 bg-danger/10 p-4">
            <Text className="text-white text-sm leading-5">
              Seu último pedido não foi aprovado. Confira os dados e envie de novo.
            </Text>
          </View>
        ) : (
          <Text className="text-muted text-sm leading-5">
            Profissionais verificados ganham um selo no perfil e nos posts. Envie seu registro para
            análise.
          </Text>
        )}

        <View>
          <Text className="text-muted text-[13px] mb-1.5">Profissão</Text>
          <View className="flex-row gap-2">
            {Object.entries(PROFESSIONAL_TYPES).map(([key, info]) => {
              const selected = type === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setType(key)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  className={`flex-1 min-h-[48px] rounded-2xl items-center justify-center border-[1.5px] ${
                    selected ? "border-accent bg-accentSoft" : "border-inputBorder bg-surface2"
                  }`}
                >
                  <Text className={`text-sm font-semibold ${selected ? "text-accent" : "text-white"}`}>
                    {info.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label={`Número do ${PROFESSIONAL_TYPES[type].registry}`}
          value={registryNumber}
          onChangeText={setRegistryNumber}
          placeholder={type === "nutritionist" ? "Só o número. Ex.: 3/12345" : "Só o número. Ex.: 012345-G/SP"}
          autoCapitalize="characters"
        />

        <View>
          <Text className="text-muted text-[13px] mb-1.5">Foto do registro</Text>
          {image ? (
            <Pressable onPress={pickDocument} accessibilityLabel="Trocar foto do registro">
              <Image
                source={{ uri: image.uri }}
                className="w-full rounded-2xl bg-divider"
                style={{ height: 200 }}
                resizeMode="cover"
              />
              <Text className="text-accent text-xs font-semibold mt-2">Trocar foto</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={pickDocument}
              accessibilityRole="button"
              className="h-32 rounded-2xl border-[1.5px] border-dashed border-faint items-center justify-center gap-2 active:opacity-80"
            >
              <Icon name="image" size="lg" color={colors.muted} />
              <Text className="text-muted text-sm">Escolher foto</Text>
            </Pressable>
          )}
        </View>

        <FormError message={formError} />
        <Button label="Enviar para análise" onPress={submit} loading={sending} />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScreenHeader title="Verificação profissional" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
          {renderBody()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
