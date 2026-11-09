import "./global.css";
import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalHost } from "@rn-primitives/portal";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { AuthProvider } from "./src/context/AuthContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ConfirmProvider } from "./src/components/ConfirmDialog";
import { colors } from "./src/theme/colors";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.dark,
    card: colors.dark,
    text: colors.text,
    primary: colors.accent,
    border: colors.divider,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.dark }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <ConfirmProvider>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </ConfirmProvider>
      </AuthProvider>
      <PortalHost />
    </SafeAreaProvider>
  );
}
