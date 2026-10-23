import React from 'react';
import { Image, Pressable } from 'react-native';

import styles from '../../styles/recipeApp';

function RecipeSaveButton({ saved, onPress, large = false }: { saved: boolean; onPress: () => void; large?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={saved ? '저장 취소' : '레시피 저장'}
      style={[styles.bookmarkButton, large && styles.bookmarkButtonLarge]}>
      <Image
        source={saved
          ? require('../../../assets/community/bookmark-filled.png')
          : require('../../../assets/community/bookmark-outline.png')}
        style={styles.bookmarkImage}
        resizeMode="contain"
      />
    </Pressable>
  );
}

export default RecipeSaveButton;
