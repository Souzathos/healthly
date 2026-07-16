import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";

const Stack = createNativeStackNavigator();

export const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#080808" } }}
  >
    <Stack.Screen name="Login" component={LoginPage} />
    <Stack.Screen name="Signup" component={SignupPage} />
  </Stack.Navigator>
);
