import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import RecipeArtwork from './RecipeArtwork';
import type { Recipe } from '../../types/recipe';
import styles from '../../styles/recipeApp';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved: boolean;
  compact?: boolean;
  onOpen: (recipe: Recipe) => void;
  onToggleSaved: (recipeId: string) => void;
}

function RecipeCard({ recipe, isSaved, compact = false, onOpen, onToggleSaved }: RecipeCardProps) {
  return (
    <View style={[styles.recipeCard, compact && styles.recipeCardCompact]}>
      <Pressable onPress={() => onOpen(recipe)} style={compact ? styles.recipeArtworkCompact : undefined}>
        <RecipeArtwork recipe={recipe} compact={compact} />
      </Pressable>
      <View style={[styles.recipeCardBody, compact && styles.recipeCardBodyCompact]}>
        <View style={styles.recipeMetaTop}>
          <Text style={styles.recipeCategory}>{recipe.category}</Text>
          <Pressable
            onPress={() => onToggleSaved(recipe.id)}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? '저장 취소' : '레시피 저장'}
            style={styles.bookmarkButton}>
            <Image
              source={isSaved
                ? require('../../../assets/community/bookmark-filled.png')
                : require('../../../assets/community/bookmark-outline.png')}
              style={styles.bookmarkImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        <Pressable onPress={() => onOpen(recipe)}>
          <Text numberOfLines={2} style={styles.recipeCardTitle}>{recipe.title}</Text>
          <Text numberOfLines={1} style={styles.recipeDescription}>{recipe.description}</Text>
        </Pressable>
        <View style={styles.recipeCardFooter}>
          <Text style={styles.recipeTinyMeta}>◷ {recipe.cookingMinutes}분</Text>
          <Text style={styles.recipeTinyMeta}>♡ {recipe.likeCount ?? recipe.rating}</Text>
          <Text style={styles.recipeTinyMeta}>저장 {recipe.saves}</Text>
        </View>
      </View>
    </View>
  );
}

export default RecipeCard;
