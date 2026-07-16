import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../services/api";

const GOALS = [
  "🏋️ Ganhar músculo",
  "🥗 Perder peso",
  "🧘 Qualidade de vida",
  "🏃 Performance",
  "❤️ Saúde geral",
];

export const SignupPage = ({ navigation }) => {
  const { signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [goal, setGoal] = useState(null);

  const titles = ["Crie sua conta", "Acesso seguro", "Seu objetivo"];

  const canAdvance = () => {
    if (step === 0) return name.trim().length >= 3;
    if (step === 1)
      return (
        email.includes("@") &&
        password.length >= 6 &&
        cpf.replace(/\D/g, "").length >= 11
      );
    return !!goal;
  };

  const handleNext = async () => {
    if (!canAdvance()) {
      Alert.alert("Atenção", "Preencha os campos corretamente para continuar.");
      return;
    }
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        cpf: cpf.replace(/\D/g, ""),
        handle: handle ? handle.replace(/^@/, "") : undefined,
        goal: goal || undefined,
      });
    } catch (e) {
      Alert.alert("Erro no cadastro", apiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-7"
      >
        {/* Header com progress */}
        <View className="flex-row items-center gap-4 pt-2">
          <Pressable
            onPress={() => (step === 0 ? navigation.goBack() : setStep((s) => s - 1))}
          >
            <Icon name="back" size={24} color="#fff" />
          </Pressable>
          <View className="flex-1 flex-row gap-1.5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="flex-1 h-[3px] rounded-full"
                style={{ backgroundColor: i <= step ? "#c8f53a" : "#222" }}
              />
            ))}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-white text-2xl font-bold mb-1.5">
            {titles[step]}
          </Text>
          <Text className="text-[#666] text-sm mb-7">Passo {step + 1} de 3</Text>

          {step === 0 && (
            <View className="gap-3.5">
              <Input
                label="Nome completo"
                placeholder="Ana Silva"
                value={name}
                onChangeText={setName}
              />
              <Input
                label="@usuário"
                placeholder="@anasilva"
                autoCapitalize="none"
                value={handle}
                onChangeText={setHandle}
              />
            </View>
          )}

          {step === 1 && (
            <View className="gap-3.5">
              <Input
                label="Email"
                placeholder="ana@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Senha"
                placeholder="••••••••"
                password
                value={password}
                onChangeText={setPassword}
              />
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                keyboardType="number-pad"
                value={cpf}
                onChangeText={setCpf}
              />
            </View>
          )}

          {step === 2 && (
            <View className="gap-2.5">
              {GOALS.map((g) => {
                const selected = goal === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGoal(g)}
                    className="rounded-2xl px-4 py-4 flex-row items-center justify-between"
                    style={{
                      backgroundColor: selected
                        ? "rgba(200,245,58,0.12)"
                        : "#181818",
                      borderWidth: 1.5,
                      borderColor: selected ? "#c8f53a" : "#222",
                    }}
                  >
                    <Text className="text-white text-[15px]">{g}</Text>
                    {selected && <Icon name="check" size={20} color="#c8f53a" />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View className="pb-4">
          <Button
            label={step < 2 ? "Continuar" : "Criar conta 🎉"}
            onPress={handleNext}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
