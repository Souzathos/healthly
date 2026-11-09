import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import { AuthStack } from "./AuthStack";
import { AppTabs } from "./AppTabs";
import { SplashPage } from "../pages/SplashPage";
import { CreatePostPage } from "../pages/CreatePostPage";
import { PostDetailPage } from "../pages/PostDetailPage";
import { ProfilePage } from "../pages/ProfilePage";
import { EditProfilePage } from "../pages/EditProfilePage";
import { ConversationsPage } from "../pages/ConversationsPage";
import { ChatPage } from "../pages/ChatPage";
import { ProfessionalRequestPage } from "../pages/ProfessionalRequestPage";
import { AdminRequestsPage } from "../pages/AdminRequestsPage";
import { HashtagPage } from "../pages/HashtagPage";

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) return <SplashPage />;

  if (!token) return <AuthStack />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.dark },
      }}
    >
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen
        name="Create"
        component={CreatePostPage}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="PostDetail" component={PostDetailPage} />
      <Stack.Screen name="UserProfile" component={ProfilePage} />
      <Stack.Screen name="EditProfile" component={EditProfilePage} />
      <Stack.Screen name="Conversations" component={ConversationsPage} />
      <Stack.Screen name="Chat" component={ChatPage} />
      <Stack.Screen name="ProfessionalRequest" component={ProfessionalRequestPage} />
      <Stack.Screen name="AdminRequests" component={AdminRequestsPage} />
      <Stack.Screen name="Hashtag" component={HashtagPage} />
    </Stack.Navigator>
  );
};
