import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "../components/Logo";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../services/api";

export const LoginPage = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha email e senha.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      Alert.alert("Erro ao entrar", apiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
          className="px-7"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center gap-3 pt-8">
            <Logo size={60} />
            <Text className="text-accent text-[28px] font-bold">Healthly</Text>
            <Text className="text-[#666] text-sm text-center">
              Sua comunidade de saúde e bem-estar
            </Text>
          </View>

          <View className="gap-3.5 py-8">
            <Input
              label="Email"
              placeholder="seu@email.com"
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
            <Button label="Entrar" onPress={handleLogin} loading={loading} />

            <View className="flex-row items-center gap-3 my-1">
              <View className="flex-1 h-px bg-line" />
              <Text className="text-[#555] text-[13px]">ou</Text>
              <View className="flex-1 h-px bg-line" />
            </View>

            <Button
              label="Criar conta"
              variant="outline"
              onPress={() => navigation.navigate("Signup")}
            />
          </View>

          <Text className="text-[#444] text-xs text-center pb-4">
            Ao entrar, você concorda com os Termos de Uso
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
