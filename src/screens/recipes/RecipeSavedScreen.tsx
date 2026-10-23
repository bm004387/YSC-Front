import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import RecipeCard from '../../components/recipes/RecipeCard';
import RecipeEmptyState from '../../components/recipes/RecipeEmptyState';
import RecipeHeader from '../../components/recipes/RecipeHeader';
import type { Recipe } from '../../types/recipe';
import styles from '../../styles/recipeApp';

interface RecipeSavedScreenProps {
  recipes: Recipe[];
  savedIds: string[];
  onOpenRecipe: (recipe: Recipe) => void;
  onToggleSaved: (id: string) => void;
}

function RecipeSavedScreen({ recipes, savedIds, onOpenRecipe, onToggleSaved }: RecipeSavedScreenProps) {
  return (
    <>
      <RecipeHeader title="저장한 레시피" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageHeadingRow}>
          <View>
            <Text style={styles.pageTitle}>나중에 만들 요리</Text>
            <Text style={styles.pageSubtitle}>마음에 든 레시피를 한곳에 모았어요.</Text>
          </View>
          <View style={styles.countPill}><Text style={styles.countPillText}>{recipes.length}</Text></View>
        </View>
        {recipes.length ? recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSaved={savedIds.includes(recipe.id)}
            onOpen={onOpenRecipe}
            onToggleSaved={onToggleSaved}
          />
        )) : <RecipeEmptyState />}
      </ScrollView>
    </>
  );
}

export default RecipeSavedScreen;
