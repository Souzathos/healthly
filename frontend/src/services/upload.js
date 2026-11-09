import { Platform } from "react-native";

// Anexa uma imagem escolhida no expo-image-picker a um FormData.
// No web o FormData precisa de um Blob real; no celular basta { uri, name, type }.
export async function appendImage(form, field, image, index = 0) {
  const name = image.fileName || `image-${index}.jpg`;
  const type = image.mimeType || "image/jpeg";

  if (Platform.OS === "web") {
    const res = await fetch(image.uri);
    let blob = await res.blob();
    // Garante um MIME válido (o backend usa isso como Content-Type ao servir a mídia).
    if (!blob.type) blob = new Blob([blob], { type });
    form.append(field, blob, name);
  } else {
    form.append(field, { uri: image.uri, name, type });
  }
}
