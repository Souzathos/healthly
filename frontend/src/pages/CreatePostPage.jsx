import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../services/posts";
import { apiError } from "../services/api";
import { notify } from "../utils/alerts";
import { colors } from "../theme/colors";

const MAX = 280;
const TAGS = ["#treino", "#dieta", "#receita", "#motivação", "#yoga"];

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
      {/* Header */}
      <View className="px-4 pb-3 flex-row items-center justify-between border-b border-[#1a1a1a]">
        <Pressable onPress={() => navigation.goBack()}>
          <Text className="text-muted text-[15px]">Cancelar</Text>
        </Pressable>
        <Text className="text-white font-semibold text-base">Novo post</Text>
        <Pressable
          onPress={submit}
          disabled={!canPost || loading}
          className="rounded-full px-4 py-2"
          style={{ backgroundColor: canPost ? colors.accent : "#2a2a2a" }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#080808" />
          ) : (
            <Text
              className="font-bold text-sm"
              style={{ color: canPost ? "#080808" : "#555" }}
            >
              Postar
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        <View className="flex-row gap-3">
          <Avatar user={user} size={44} />
          <View className="flex-1">
            <TextInput
              value={text}
              onChangeText={(t) => t.length <= MAX && setText(t)}
              placeholder="O que você está fazendo pela sua saúde hoje?"
              placeholderTextColor="#555"
              multiline
              className="text-white text-base"
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
                    <Pressable
                      onPress={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-1 right-1 items-center justify-center"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "rgba(0,0,0,0.7)",
                      }}
                    >
                      <Icon name="x" size={12} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Sugestões de tags */}
        <View className="flex-row flex-wrap gap-2 mt-4">
          {TAGS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setText((s) => (s + " " + t).trim().slice(0, MAX))}
              className="rounded-full px-3 py-1.5 bg-surface2 border border-line"
            >
              <Text className="text-muted text-xs">{t}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Toolbar */}
      <View className="px-4 py-3 border-t border-[#1a1a1a] flex-row items-center justify-between">
        <View className="flex-row gap-5">
          <Pressable onPress={pickImage}>
            <Icon name="image" size={22} color={colors.accent} />
          </Pressable>
          <Pressable onPress={pickImage}>
            <Icon name="camera" size={22} color={colors.muted} />
          </Pressable>
        </View>
        <Text
          className="text-xs font-semibold"
          style={{
            color:
              text.length >= MAX
                ? colors.danger
                : text.length > MAX * 0.8
                ? colors.accent
                : "#555",
          }}
        >
          {MAX - text.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};
