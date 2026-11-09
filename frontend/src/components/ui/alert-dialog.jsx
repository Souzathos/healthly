import React from "react";
import { Platform, View } from "react-native";
import * as AlertDialogPrimitive from "@rn-primitives/alert-dialog";
import Animated, { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated";
import { Pressable } from "react-native";
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens";
import { cn } from "../../lib/utils";
import { buttonTextVariants, buttonVariants } from "./button";
import { TextClassContext } from "./text";

// Adaptado do React Native Reusables para o tema do Healthly
export const AlertDialog = AlertDialogPrimitive.Root;

const FullWindowOverlay = Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AlertDialogOverlay({ children }) {
  const className =
    "absolute bottom-0 left-0 right-0 top-0 z-50 items-center justify-center bg-black/70 p-4";

  if (Platform.OS === "web") {
    return (
      <AlertDialogPrimitive.Overlay className={cn(className, "fixed")}>
        {children}
      </AlertDialogPrimitive.Overlay>
    );
  }

  return (
    <FullWindowOverlay>
      <AlertDialogPrimitive.Overlay className={className} asChild>
        <AnimatedPressable
          entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
        >
          {children}
        </AnimatedPressable>
      </AlertDialogPrimitive.Overlay>
    </FullWindowOverlay>
  );
}

export function AlertDialogContent({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogOverlay>
        <AlertDialogPrimitive.Content
          className={cn(
            "z-50 w-full max-w-[400px] gap-4 rounded-2xl border border-line bg-surface p-6",
            className
          )}
          {...props}
        />
      </AlertDialogOverlay>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogHeader({ className, ...props }) {
  return <View className={cn("gap-2", className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }) {
  return <View className={cn("gap-2", className)} {...props} />;
}

export function AlertDialogTitle({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-white text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-muted text-sm leading-5", className)}
      {...props}
    />
  );
}

export function AlertDialogAction({ className, variant = "accent", ...props }) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant })}>
      <AlertDialogPrimitive.Action
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export function AlertDialogCancel({ className, ...props }) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant: "ghost" })}>
      <AlertDialogPrimitive.Cancel
        className={cn(buttonVariants({ variant: "ghost" }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
