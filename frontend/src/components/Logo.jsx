import React from "react";
import { View, Text } from "react-native";

// Placeholder do abacate (o design usa assets/logo.png)
export const Logo = ({ size = 36 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      backgroundColor: "rgba(200,245,58,0.14)",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: size * 0.55 }}>🥑</Text>
  </View>
);
