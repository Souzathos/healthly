import { Alert, Platform } from "react-native";

// Aviso simples que funciona no celular (Alert) e no navegador (window.alert).
export function notify(title, message) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
