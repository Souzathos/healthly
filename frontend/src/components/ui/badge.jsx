import React from "react";
import { View } from "react-native";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { TextClassContext } from "./text";

// Adaptado do React Native Reusables para o tema do Healthly
const badgeVariants = cva("shrink-0 flex-row items-center justify-center rounded-full", {
  variants: {
    variant: {
      soft: "bg-accentSoft px-2.5 py-1",
      count: "bg-danger min-w-[18px] h-[18px] px-1",
    },
  },
  defaultVariants: { variant: "soft" },
});

const badgeTextVariants = cva("", {
  variants: {
    variant: {
      soft: "text-accent text-xs font-semibold",
      count: "text-white text-[11px] font-bold",
    },
  },
  defaultVariants: { variant: "soft" },
});

export function Badge({ className, variant, ...props }) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View className={cn(badgeVariants({ variant }), className)} {...props} />
    </TextClassContext.Provider>
  );
}
