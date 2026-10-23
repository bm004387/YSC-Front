import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import RecipeCard from '../../components/recipes/RecipeCard';
import RecipeEmptyState from '../../components/recipes/RecipeEmptyState';
import RecipeHeader from '../../components/recipes/RecipeHeader';
import type { Recipe } from '../../types/recipe';
import styles from '../../styles/recipeApp';

interface MyRecipesScreenProps {
  recipes: Recipe[];
  savedCount: number;
  onWrite: () => void;
  onLogout: () => void;
  onOpenRecipe: (recipe: Recipe) => void;
  onToggleSaved: (id: string) => void;
  savedIds: string[];
}

function MyRecipesScreen({ recipes, savedCount, onWrite, onLogout, onOpenRecipe, onToggleSaved, savedIds }: MyRecipesScreenProps) {
  return (
    <>
      <RecipeHeader title="내 요리" right={(
        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      )} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>나</Text></View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>나의 식탁</Text>
            <Text style={styles.profileCaption}>오늘의 한 끼를 기록하고 나눠요.</Text>
          </View>
          <Pressable onPress={onWrite} style={styles.profileAddButton} accessibilityRole="button" accessibilityLabel="레시피 작성">
            <Text style={styles.profileAddGlyph}>＋</Text>
          </Pressable>
        </View>
        <View style={styles.statsRow}>
          <Stat value={String(recipes.length)} label="레시피" />
          <View style={styles.statDivider} />
          <Stat value={String(savedCount)} label="저장" />
          <View style={styles.statDivider} />
          <Stat value="꾸준히" label="요리 기록" />
        </View>
        <View style={styles.myRecipesHeading}>
          <View>
            <Text style={styles.sectionTitle}>내가 만든 레시피</Text>
            <Text style={styles.sectionCaption}>나만의 맛을 기록해 보세요.</Text>
          </View>
          <Pressable onPress={onWrite} style={styles.outlineAction}>
            <Text style={styles.outlineActionText}>＋ 작성</Text>
          </Pressable>
        </View>
        {recipes.length ? recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSaved={savedIds.includes(recipe.id)}
            onOpen={onOpenRecipe}
            onToggleSaved={onToggleSaved}
          />
        )) : <RecipeEmptyState title="첫 레시피를 만들어 보세요" description="나만의 맛있는 순간을 기록하고 공유해요." />}
      </ScrollView>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.statItem}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

export default MyRecipesScreen;
