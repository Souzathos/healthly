import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { IconButton } from "../components/IconButton";
import { HeaderAction, ScreenHeader } from "../components/ScreenHeader";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../services/posts";
import { apiError } from "../services/api";
import { notify } from "../utils/alerts";
import { colors } from "../theme/colors";

const MAX = 280;

export const CreatePostPage = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      notify("Permissão", "Precisamos de acesso às suas fotos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 4,
    });
    if (!result.canceled) {
      setImages((prev) =>
        [
          ...prev,
          ...result.assets.map((a) => ({
            uri: a.uri,
            mimeType: a.mimeType,
            fileName: a.fileName || undefined,
          })),
        ].slice(0, 4)
      );
    }
  };

  const submit = async () => {
    if (!text.trim() && images.length === 0) return;
    setLoading(true);
    try {
      await createPost(text.trim(), images);
      navigation.goBack();
    } catch (e) {
      notify("Erro ao postar", apiError(e));
    } finally {
      setLoading(false);
    }
  };

  const canPost = text.trim().length > 0 || images.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScreenHeader
        title="Novo post"
        left={<HeaderAction label="Cancelar" muted onPress={() => navigation.goBack()} />}
        right={
          <HeaderAction label="Postar" onPress={submit} disabled={!canPost} loading={loading} />
        }
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <View className="flex-row gap-3">
          <Avatar user={user} size={44} />
          <View className="flex-1">
            <TextInput
              value={text}
              onChangeText={(t) => t.length <= MAX && setText(t)}
              placeholder="O que você está fazendo pela sua saúde hoje?"
              placeholderTextColor={colors.mutedDark}
              multiline
              className={`text-white text-base ${Platform.OS === "web" ? "outline-none" : ""}`}
              style={{ minHeight: 120, textAlignVertical: "top", lineHeight: 24 }}
            />

            {images.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-2">
                {images.map((img, i) => (
                  <View key={i} className="relative">
                    <Image
                      source={{ uri: img.uri }}
                      style={{ width: 100, height: 100, borderRadius: 12 }}
                    />
                    <IconButton
                      name="x"
                      label="Remover imagem"
                      size="sm"
                      onPress={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute -top-2 -right-2"
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

      </ScrollView>

      {/* Toolbar */}
      <View className="pl-1.5 pr-4 py-1 border-t border-divider flex-row items-center justify-between">
        <IconButton
          name="image"
          label="Adicionar imagens"
          color={colors.accent}
          onPress={pickImage}
        />
        <Text
          className="text-xs font-semibold"
          style={{
            color:
              text.length >= MAX
                ? colors.danger
                : text.length > MAX * 0.8
                ? colors.accent
                : colors.mutedDark,
          }}
        >
          {MAX - text.length}
        </Text>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
