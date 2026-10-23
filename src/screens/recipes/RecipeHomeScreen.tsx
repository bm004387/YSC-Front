import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import RecipeArtwork from '../../components/recipes/RecipeArtwork';
import RecipeCard from '../../components/recipes/RecipeCard';
import RecipeCategories from '../../components/recipes/RecipeCategories';
import RecipeHeader from '../../components/recipes/RecipeHeader';
import RecipeEmptyState from '../../components/recipes/RecipeEmptyState';
import type { Recipe, RecipeCategory } from '../../types/recipe';
import styles from '../../styles/recipeApp';

interface RecipeHomeScreenProps {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  categories: RecipeCategory[];
  savedIds: string[];
  searchText: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onOpenRecipe: (recipe: Recipe) => void;
  onToggleSaved: (id: string) => void;
  onWrite: () => void;
}

function RecipeHomeScreen(props: RecipeHomeScreenProps) {
  const featured = props.recipes[0];
  const popularRecipes = props.filteredRecipes.filter(recipe => recipe.id !== featured?.id);

  return (
    <>
      <RecipeHeader right={(
        <Pressable onPress={props.onWrite} style={styles.headerIconButton} accessibilityRole="button" accessibilityLabel="레시피 작성">
          <Text style={styles.headerIcon}>＋</Text>
        </Pressable>
      )} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.eyebrow}>오늘의 식탁</Text>
            <Text style={styles.pageTitle}>오늘 뭐 먹지?</Text>
            <Text style={styles.pageSubtitle}>한 끼가 즐거워지는 레시피를 만나보세요.</Text>
          </View>
          <Text style={styles.welcomeEmoji}>🥄</Text>
        </View>
        <View style={styles.homeSearchBar}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <TextInput
            value={props.searchText}
            onChangeText={props.onSearchChange}
            placeholder="어떤 요리를 찾으세요?"
            placeholderTextColor="#A99B90"
            style={styles.homeSearchInput}
            returnKeyType="search"
            accessibilityLabel="홈에서 레시피 검색"
          />
          {props.searchText.length > 0 && <Pressable onPress={() => props.onSearchChange('')}><Text style={styles.clearSearch}>×</Text></Pressable>}
        </View>
        <RecipeCategories selected={props.selectedCategory} onSelect={props.onCategoryChange} categories={props.categories} />
        {featured && (
          <Pressable onPress={() => props.onOpenRecipe(featured)} style={styles.featuredCard}>
            <RecipeArtwork recipe={featured} large />
            <View style={styles.featuredOverlay}>
              <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>오늘의 추천</Text></View>
              <Text style={styles.featuredTitle}>{featured.title}</Text>
              <Text style={styles.featuredSubtitle}>{featured.description}</Text>
              <View style={styles.featuredMetaRow}>
                <Text style={styles.featuredMeta}>♡ {featured.likeCount ?? featured.rating}</Text>
                <Text style={styles.featuredDot}>·</Text>
                <Text style={styles.featuredMeta}>◷ {featured.cookingMinutes}분</Text>
                <Text style={styles.featuredDot}>·</Text>
                <Text style={styles.featuredMeta}>저장 {featured.saves}</Text>
              </View>
            </View>
            <View style={styles.featuredArrow}><Text style={styles.featuredArrowText}>↗</Text></View>
          </Pressable>
        )}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>오늘의 인기 레시피</Text>
            <Text style={styles.sectionCaption}>많이 저장한 한 끼를 모았어요</Text>
          </View>
          <Pressable onPress={() => { props.onSearchChange(''); props.onCategoryChange('전체'); }}>
            <Text style={styles.sectionLink}>더 보기 ›</Text>
          </Pressable>
        </View>
        {popularRecipes.length ? popularRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            compact
            isSaved={props.savedIds.includes(recipe.id)}
            onOpen={props.onOpenRecipe}
            onToggleSaved={props.onToggleSaved}
          />
        )) : <RecipeEmptyState title="검색 결과가 없어요" description="다른 요리 이름이나 재료로 찾아보세요." />}
        <View style={styles.bottomNote}><Text style={styles.bottomNoteText}>오늘도 맛있는 한 끼, 한끼모아와 함께 🍅</Text></View>
      </ScrollView>
    </>
  );
}

export default RecipeHomeScreen;
