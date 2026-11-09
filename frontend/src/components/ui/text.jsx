import React from "react";
import { Text as RNText } from "react-native";
import { cn } from "../../lib/utils";

// Permite que um Button ou Badge defina a cor e o peso do texto dentro dele
export const TextClassContext = React.createContext(undefined);

export function Text({ className, ...props }) {
  const textClass = React.useContext(TextClassContext);
  return <RNText className={cn("text-white text-base", textClass, className)} {...props} />;
}
