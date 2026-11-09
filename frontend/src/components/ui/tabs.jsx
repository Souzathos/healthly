import React from "react";
import { Platform } from "react-native";
import * as TabsPrimitive from "@rn-primitives/tabs";
import { cn } from "../../lib/utils";
import { TextClassContext } from "./text";

// Adaptado do React Native Reusables: abas sublinhadas, ocupando a largura toda
export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn("flex-row border-b border-divider", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  const { value } = TabsPrimitive.useRootContext();
  const active = value === props.value;

  return (
    <TextClassContext.Provider
      value={cn("text-sm", active ? "text-white font-semibold" : "text-mutedDark font-medium")}
    >
      {/* A borda transparente evita o layout pular ao trocar de aba */}
      <TabsPrimitive.Trigger
        className={cn(
          "flex-1 items-center justify-center min-h-[44px] border-b-2",
          active ? "border-accent" : "border-transparent",
          Platform.select({ web: "outline-none cursor-pointer" }),
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
