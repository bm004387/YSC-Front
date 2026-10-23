import React from 'react';
import { Text, View } from 'react-native';

import styles from '../../styles/recipeApp';

function RecipeEmptyState({ title = '아직 레시피가 없어요', description = '마음에 드는 한 끼를 찾아 저장해 보세요.' }: {
  title?: string;
  description?: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

export default RecipeEmptyState;
