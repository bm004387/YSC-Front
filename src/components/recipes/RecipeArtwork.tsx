import React from 'react';
import { Text, View } from 'react-native';

import type { Recipe } from '../../types/recipe';
import styles from '../../styles/recipeApp';

function RecipeArtwork({ recipe, large = false, compact = false }: { recipe: Recipe; large?: boolean; compact?: boolean }) {
  return (
    <View style={[styles.artwork, large ? styles.artworkLarge : compact ? styles.artworkCompact : styles.artworkCard, { backgroundColor: recipe.artwork }]}>
      <View style={[styles.plateOuter, large && styles.plateOuterLarge]}>
        <View style={[styles.plateInner, large && styles.plateInnerLarge]}>
          <Text style={[styles.foodEmoji, large && styles.foodEmojiLarge]}>{recipe.emoji}</Text>
        </View>
      </View>
      {large && (
        <View style={styles.artworkSparkle}>
          <Text style={styles.sparkleText}>오늘의 한 끼</Text>
        </View>
      )}
    </View>
  );
}

export default RecipeArtwork;
