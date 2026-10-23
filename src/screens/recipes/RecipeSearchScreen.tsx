import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import RecipeCard from '../../components/recipes/RecipeCard';
import RecipeCategories from '../../components/recipes/RecipeCategories';
import RecipeHeader from '../../components/recipes/RecipeHeader';
import RecipeEmptyState from '../../components/recipes/RecipeEmptyState';
import type { Recipe, RecipeCategory } from '../../types/recipe';
import styles from '../../styles/recipeApp';

interface RecipeSearchScreenProps {
  recipes: Recipe[];
  categories: RecipeCategory[];
  savedIds: string[];
  searchText: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onOpenRecipe: (recipe: Recipe) => void;
  onToggleSaved: (id: string) => void;
}

function RecipeSearchScreen(props: RecipeSearchScreenProps) {
  return (
    <>
      <RecipeHeader title="레시피 검색" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>무엇이 먹고 싶나요?</Text>
        <Text style={styles.pageSubtitle}>요리 이름이나 재료로 찾아보세요.</Text>
        <View style={styles.searchInputWrap}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <TextInput
            value={props.searchText}
            onChangeText={props.onSearchChange}
            placeholder="예: 두부, 파스타, 계란"
            placeholderTextColor="#A99B90"
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="레시피 검색어"
          />
          {props.searchText.length > 0 && <Pressable onPress={() => props.onSearchChange('')}><Text style={styles.clearSearch}>×</Text></Pressable>}
        </View>
        <RecipeCategories selected={props.selectedCategory} onSelect={props.onCategoryChange} categories={props.categories} />
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>{props.searchText ? '검색 결과' : '둘러보기'}</Text>
            <Text style={styles.sectionCaption}>{props.recipes.length}개의 레시피</Text>
          </View>
          <Text style={styles.sortLabel}>인기순⌄</Text>
        </View>
        {props.recipes.length ? props.recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSaved={props.savedIds.includes(recipe.id)}
            onOpen={props.onOpenRecipe}
            onToggleSaved={props.onToggleSaved}
          />
        )) : <RecipeEmptyState title="검색 결과가 없어요" description="다른 요리 이름이나 재료로 찾아보세요." />}
      </ScrollView>
    </>
  );
}

export default RecipeSearchScreen;
