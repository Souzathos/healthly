import { Alert, Platform } from "react-native";

// Aviso simples que funciona no celular (Alert) e no navegador (window.alert).
export function notify(title, message) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

// Confirmação (Cancelar / Confirmar) — no web o Alert.alert do RN não dispara
// os callbacks dos botões, então usamos window.confirm.
export function confirmAction(
  title,
  message,
  onConfirm,
  confirmLabel = "Confirmar"
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}
