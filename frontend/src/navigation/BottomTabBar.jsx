import React from "react";
import { View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { colors } from "../theme/colors";

const ICONS = {
  Home: { name: "home", label: "Início" },
  Search: { name: "search", label: "Buscar" },
  Notifications: { name: "bell", label: "Notificações" },
  Profile: { name: "user", label: "Perfil" },
};

const ORDER = ["Home", "Search", "Create", "Notifications", "Profile"];
// Área mínima no web e em aparelhos sem home indicator
const BOTTOM_PADDING = 8;

export const BottomTabBar = ({ state, navigation }) => {
  const stackNav = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-around bg-dark border-t border-divider pt-2 px-2"
      style={{ paddingBottom: Math.max(insets.bottom, BOTTOM_PADDING) }}
    >
      {ORDER.map((routeName) => {
        if (routeName === "Create") {
          return (
            <Pressable
              key="Create"
              onPress={() => stackNav.navigate("Create")}
              accessibilityRole="button"
              accessibilityLabel="Novo post"
              className="w-12 h-12 items-center justify-center bg-accent active:opacity-90"
              style={{
                borderRadius: 14,
                shadowColor: colors.accent,
                shadowOpacity: 0.3,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              <Icon name="plus" size="lg" color={colors.dark} />
            </Pressable>
          );
        }

        const routeIndex = state.routes.findIndex((r) => r.name === routeName);
        const isFocused = state.index === routeIndex;

        return (
          <Pressable
            key={routeName}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: state.routes[routeIndex].key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(routeName);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={ICONS[routeName].label}
            accessibilityState={{ selected: isFocused }}
            className="w-12 h-12 items-center justify-center active:opacity-70"
          >
            <Icon
              name={ICONS[routeName].name}
              size="lg"
              color={isFocused ? colors.accent : colors.mutedDark}
            />
          </Pressable>
        );
      })}
    </View>
  );
};
