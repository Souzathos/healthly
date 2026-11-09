import React from "react";
import { Text, View } from "react-native";
import { VerifiedBadge } from "./VerifiedBadge";
import { cn } from "../lib/utils";

// Nome com o selo de profissional verificado ao lado, quando houver
export const UserName = ({ user, className, badgeSize = 14 }) => (
  <View className="flex-row items-center gap-1 shrink">
    <Text className={cn("text-white font-semibold text-sm shrink", className)} numberOfLines={1}>
      {user?.name || "Usuário"}
    </Text>
    {user?.isVerified ? <VerifiedBadge size={badgeSize} /> : null}
  </View>
);
