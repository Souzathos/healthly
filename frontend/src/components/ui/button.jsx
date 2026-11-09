import React from "react";
import { Platform, Pressable } from "react-native";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { TextClassContext } from "./text";

// Adaptado do React Native Reusables para o tema do Healthly
export const buttonVariants = cva(
  cn(
    "shrink-0 flex-row items-center justify-center gap-2",
    Platform.select({ web: "outline-none transition-all" })
  ),
  {
    variants: {
      variant: {
        accent: "bg-accent active:opacity-90",
        outline: "bg-transparent border-[1.5px] border-accent active:opacity-80",
        ghost: "bg-surface2 border border-faint active:opacity-80",
        danger: "bg-danger active:opacity-90",
      },
      size: {
        lg: "w-full min-h-[52px] px-4 rounded-2xl",
        sm: "min-h-[40px] px-5 rounded-full",
      },
    },
    defaultVariants: { variant: "accent", size: "lg" },
  }
);

export const buttonTextVariants = cva("", {
  variants: {
    variant: {
      accent: "text-dark",
      outline: "text-accent",
      ghost: "text-white",
      danger: "text-white",
    },
    size: {
      lg: "text-base font-bold",
      sm: "text-sm font-semibold",
    },
  },
  defaultVariants: { variant: "accent", size: "lg" },
});

export function Button({ className, variant, size, ...props }) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        role="button"
        className={cn(props.disabled && "opacity-60", buttonVariants({ variant, size }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
