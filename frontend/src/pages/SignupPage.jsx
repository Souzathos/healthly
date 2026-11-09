import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { colors } from "../theme/colors";
import { FormError } from "../components/FormError";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../services/api";
import { formatCpf, onlyDigits } from "../utils/cpf";

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
  const [error, setError] = useState("");

  const titles = ["Crie sua conta", "Acesso seguro", "Seu objetivo"];

  // Mensagem do primeiro problema do passo atual, ou "" se pode avançar
  const stepError = () => {
    if (step === 0) return name.trim().length >= 3 ? "" : "O nome deve ter ao menos 3 caracteres.";
    if (step === 1) {
      if (!email.includes("@")) return "Informe um e-mail válido.";
      if (password.length < 6) return "A senha deve ter ao menos 6 caracteres.";
      if (onlyDigits(cpf).length !== 11) return "O CPF deve ter 11 números.";
      return "";
    }
    return goal ? "" : "Escolha um objetivo para continuar.";
  };

  const handleNext = async () => {
    setError("");
    const problem = stepError();
    if (problem) {
      setError(problem);
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
        cpf: onlyDigits(cpf),
        handle: handle ? handle.replace(/^@/, "") : undefined,
        goal: goal || undefined,
      });
    } catch (e) {
      setError(apiError(e));
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
        <View className="flex-row items-center gap-2 pt-1">
          <IconButton
            name="back"
            label="Voltar"
            onPress={() => (step === 0 ? navigation.goBack() : setStep((s) => s - 1))}
            className="-ml-2.5"
          />
          <View className="flex-1 flex-row gap-1.5">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="flex-1 h-[3px] rounded-full"
                style={{ backgroundColor: i <= step ? colors.accent : colors.line }}
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
          <Text className="text-muted text-sm mb-7">Passo {step + 1} de 3</Text>

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
                onChangeText={(value) => setCpf(formatCpf(value))}
                maxLength={14}
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
                        : colors.surface2,
                      borderWidth: 1.5,
                      borderColor: selected ? colors.accent : colors.line,
                    }}
                  >
                    <Text className="text-white text-[15px]">{g}</Text>
                    {selected && <Icon name="check" size="md" color={colors.accent} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View className="pb-4 gap-3">
          <FormError message={error} />
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
