import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import RecipeArtwork from '../../components/recipes/RecipeArtwork';
import RecipeHeader from '../../components/recipes/RecipeHeader';
import RecipeSaveButton from '../../components/recipes/RecipeSaveButton';
import type { Recipe } from '../../types/recipe';
import styles from '../../styles/recipeApp';

function RecipeDetailScreen({ recipe, saved, onBack, onToggleSaved }: {
  recipe: Recipe;
  saved: boolean;
  onBack: () => void;
  onToggleSaved: () => void;
}) {
  return (
    <>
      <RecipeHeader title="레시피" onBack={onBack} right={<RecipeSaveButton saved={saved} onPress={onToggleSaved} large />} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
        <RecipeArtwork recipe={recipe} large />
        <View style={styles.detailTitleBlock}>
          <View style={styles.detailCategoryPill}><Text style={styles.detailCategoryText}>{recipe.category}</Text></View>
          <Text style={styles.detailTitle}>{recipe.title}</Text>
          <Text style={styles.detailDescription}>{recipe.description}</Text>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}><Text style={styles.authorAvatarText}>{recipe.authorInitial}</Text></View>
            <View style={styles.authorCopy}>
              <Text style={styles.authorName}>{recipe.author}</Text>
              <Text style={styles.authorCaption}>한끼모아 레시피</Text>
            </View>
            <Text style={styles.authorRating}>♡ {recipe.likeCount ?? recipe.rating}</Text>
          </View>
        </View>
        <View style={styles.detailQuickFacts}>
          <QuickFact icon="◷" value={`${recipe.cookingMinutes}분`} label="조리 시간" />
          <QuickFact icon="♨" value={recipe.difficulty || '보통'} label="난이도" />
          <QuickFact icon="♡" value={String(recipe.servings ?? 0)} label="인분" />
        </View>
        <View style={styles.detailSection}>
          <View style={styles.detailSectionHeading}>
            <Text style={styles.detailSectionTitle}>재료</Text>
            <Text style={styles.ingredientCount}>{recipe.ingredients.length}가지</Text>
          </View>
          {recipe.ingredients.map((ingredient, index) => (
            <IngredientRow key={`${recipe.id}-ingredient-${index}`} ingredient={ingredient} />
          ))}
        </View>
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>만드는 순서</Text>
          {recipe.steps.map((step, index) => <StepRow key={`${recipe.id}-step-${index}`} number={index + 1} step={step} />)}
        </View>
        <View style={styles.detailEndNote}><Text style={styles.detailEndEmoji}>🥣</Text><Text style={styles.detailEndText}>맛있게 드세요!</Text></View>
      </ScrollView>
    </>
  );
}

function QuickFact({ icon, value, label }: { icon: string; value: string; label: string }) {
  return <View style={styles.quickFact}><Text style={styles.quickFactIcon}>{icon}</Text><Text style={styles.quickFactValue}>{value}</Text><Text style={styles.quickFactLabel}>{label}</Text></View>;
}

function IngredientRow({ ingredient }: { ingredient: string }) {
  const [checked, setChecked] = React.useState(false);
  return (
    <Pressable onPress={() => setChecked(value => !value)} style={styles.ingredientRow}>
      <View style={[styles.ingredientCheck, checked && styles.ingredientCheckActive]}><Text style={styles.ingredientCheckMark}>{checked ? '✓' : ''}</Text></View>
      <Text style={[styles.ingredientText, checked && styles.ingredientTextChecked]}>{ingredient}</Text>
      <Text style={styles.ingredientAction}>{checked ? '준비 완료' : '체크'}</Text>
    </Pressable>
  );
}

function StepRow({ number, step }: { number: number; step: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View>
      <Text style={styles.stepText}>{step}</Text>
    </View>
  );
}

export default RecipeDetailScreen;
