import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import styles from '../../styles/recipeApp';

interface RecipeHeaderProps {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}

function RecipeHeader({ title, right, onBack }: RecipeHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" style={styles.backButton}>
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.brandHeading}>
          <Image
            source={require('../../../assets/brand/recipe-logo-transparent.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="한끼모아 로고"
          />
          <Text style={styles.brandName}>한끼모아</Text>
        </View>
      )}
      {onBack && <Text style={styles.headerTitle}>{title}</Text>}
      {right ?? <View style={styles.headerActionPlaceholder} />}
    </View>
  );
}

export default RecipeHeader;
