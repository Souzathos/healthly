import React from "react";
import { View, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../components/Icon";
import { colors } from "../theme/colors";

const ICONS = {
  Home: "home",
  Search: "search",
  Notifications: "bell",
  Profile: "user",
};

export const BottomTabBar = ({ state, navigation }) => {
  const stackNav = useNavigation();

  const order = ["Home", "Search", "Create", "Notifications", "Profile"];

  return (
    <View
      className="flex-row items-center justify-around bg-dark border-t border-[#1a1a1a]"
      style={{ height: 82, paddingBottom: 18, paddingHorizontal: 8 }}
    >
      {order.map((routeName) => {
        if (routeName === "Create") {
          return (
            <Pressable
              key="Create"
              onPress={() => stackNav.navigate("Create")}
              className="items-center justify-center bg-accent"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                shadowColor: colors.accent,
                shadowOpacity: 0.3,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Icon name="plus" size={24} color="#080808" />
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
            className="items-center justify-center px-3 py-2"
          >
            <Icon
              name={ICONS[routeName]}
              size={24}
              color={isFocused ? colors.accent : "#555"}
            />
          </Pressable>
        );
      })}
    </View>
  );
};
