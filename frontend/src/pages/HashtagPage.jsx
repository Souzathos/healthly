import React, { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { PostFeed } from "../components/PostFeed";
import { ScreenHeader } from "../components/ScreenHeader";
import { getHashtagPosts } from "../services/posts";

export const HashtagPage = ({ route, navigation }) => {
  const { tag } = route.params;
  const loader = useCallback((page) => getHashtagPosts(tag, page), [tag]);

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScreenHeader title={`#${tag}`} onBack={() => navigation.goBack()} />
      <PostFeed
        loader={loader}
        reloadKey={tag}
        emptyIcon="grid"
        emptyMessage={`Ainda não há posts com #${tag}.`}
      />
    </SafeAreaView>
  );
};
