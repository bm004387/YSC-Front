import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { RECIPE_CATEGORIES, type RecipeCategory } from '../../types/recipe';
import styles from '../../styles/recipeApp';

function RecipeCategories({ selected, onSelect, categories, includeAll = true }: {
  selected: string;
  onSelect: (category: string) => void;
  categories?: RecipeCategory[];
  includeAll?: boolean;
}) {
  const categoryNames = categories?.length
    ? [...(includeAll ? [{ code: '', name: '전체' }] : []), ...categories.map(item => ({ code: item.code, name: item.name }))]
    : (includeAll ? RECIPE_CATEGORIES : RECIPE_CATEGORIES.filter(item => item !== '전체')).map(name => ({ code: '', name }));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
      {categoryNames.map(category => (
        <Pressable
          key={`${category.code}:${category.name}`}
          onPress={() => onSelect(category.name)}
          style={[styles.categoryChip, selected === category.name && styles.categoryChipActive]}>
          <Text style={[styles.categoryText, selected === category.name && styles.categoryTextActive]}>{category.name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default RecipeCategories;
