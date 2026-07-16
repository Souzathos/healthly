import React from "react";
import { Image } from "react-native";

// Logo do app (abacate fitness). Usada no Splash, Login e header da Home.
export const Logo = ({ size = 36 }) => (
  <Image
    source={require("../../assets/logo.png")}
    style={{ width: size, height: size }}
    resizeMode="contain"
  />
);
