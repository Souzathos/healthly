import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Chip } from "./Chip";
import { PostFeed } from "./PostFeed";
import { getTrendingHashtags, searchPosts } from "../services/posts";
import { DIETS } from "../utils/diets";

const DEBOUNCE_MS = 300;

// Aba "Posts" da busca: texto + filtro de dieta, com as hashtags em alta no topo
export const PostSearch = ({ q }) => {
  const navigation = useNavigation();
  const [diet, setDiet] = useState(null);
  const [trending, setTrending] = useState([]);
  // O texto só vale depois de uma pausa na digitação
  const [term, setTerm] = useState(q.trim());

  useEffect(() => {
    const timer = setTimeout(() => setTerm(q.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [q]);

  useFocusEffect(
    useCallback(() => {
      getTrendingHashtags()
        .then(setTrending)
        .catch(() => setTrending([]));
    }, [])
  );

  const loader = useCallback((page) => searchPosts({ q: term, diet, page }), [term, diet]);

  const header = (
    <View className="pb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {Object.entries(DIETS).map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            selected={diet === key}
            onPress={() => setDiet((current) => (current === key ? null : key))}
          />
        ))}
      </ScrollView>

      {!term && trending.length > 0 ? (
        <View className="px-4 pt-5">
          <Text className="text-white text-[15px] font-semibold mb-3">Em alta na semana</Text>
          <View className="flex-row flex-wrap gap-2">
            {trending.map((tag) => (
              <Chip
                key={tag.name}
                label={`#${tag.name} · ${tag.postsCount}`}
                onPress={() => navigation.push("Hashtag", { tag: tag.name })}
              />
            ))}
          </View>
        </View>
      ) : null}

      <Text className="text-mutedDark text-xs px-4 pt-5 pb-1">
        {term ? `Posts com "${term}"` : diet ? `Posts ${DIETS[diet].toLowerCase()}` : "Posts recentes"}
      </Text>
    </View>
  );

  return (
    <PostFeed
      loader={loader}
      reloadKey={`${term}|${diet ?? ""}`}
      ListHeaderComponent={header}
      emptyIcon="search"
      emptyMessage="Nenhum post encontrado com esses filtros."
    />
  );
};
