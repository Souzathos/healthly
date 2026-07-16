import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabBar } from "./BottomTabBar";
import { HomePage } from "../pages/HomePage";
import { SearchPage } from "../pages/SearchPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { ProfilePage } from "../pages/ProfilePage";

const Tab = createBottomTabNavigator();

// Placeholder — a tab "Create" nunca é exibida (interceptada pela tab bar)
const Empty = () => <View className="flex-1 bg-dark" />;

export const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Search" component={SearchPage} />
      <Tab.Screen name="Create" component={Empty} />
      <Tab.Screen name="Notifications" component={NotificationsPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};
