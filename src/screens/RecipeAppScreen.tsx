import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, View } from 'react-native';

import BrandLoader from '../components/common/BrandLoader';
import { getCommonCodeList, type CommonCodeItem } from '../api/commonCodeApi';
import { getRecipe, getRecipes, setRecipeSaved, type RecipeResponse } from '../api/recipeApi';
import { logout } from '../api/authApi';
import { clearAuthCredentials, getAuthCredentials } from '../storage/tokenStorage';
import useMsg from '../hooks/useMsg';
import RecipeCreateScreen from './recipes/RecipeCreateScreen';
import RecipeDetailScreen from './recipes/RecipeDetailScreen';
import RecipeHomeScreen from './recipes/RecipeHomeScreen';
import MyRecipesScreen from './recipes/MyRecipesScreen';
import RecipeSavedScreen from './recipes/RecipeSavedScreen';
import RecipeSearchScreen from './recipes/RecipeSearchScreen';
import type { Recipe, RecipeCategory, RecipeDraft, RecipeTab } from '../types/recipe';
import styles from '../styles/recipeApp';

interface RecipeAppScreenProps {
  activeTab: RecipeTab;
  onLogout: () => void;
}

type Page = 'tab' | 'detail' | 'write';

function RecipeAppScreen({ activeTab, onLogout }: RecipeAppScreenProps) {
  const { getMsg } = useMsg();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [commonCodes, setCommonCodes] = useState<CommonCodeItem[]>([]);
  const [commonCodesLoading, setCommonCodesLoading] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [page, setPage] = useState<Page>('tab');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const recipeRequestId = useRef(0);
  const detailRequestId = useRef(0);

  const selectedRecipe = detailRecipe ?? recipes.find(recipe => recipe.id === selectedRecipeId);
  const savedIds = useMemo(() => recipes.filter(recipe => recipe.savedByMe).map(recipe => recipe.id), [recipes]);
  const selectedCategoryCode = categories.find(category => category.name === selectedCategory)?.code;
  const queryScope = activeTab === 'myRecipes' ? 'mine' : activeTab === 'saved' ? 'saved' : 'all';

  useEffect(() => {
    let mounted = true;
    getCommonCodeList()
      .then((codes: CommonCodeItem[]) => {
        if (!mounted) return;
        setCommonCodes(codes);
        setCategories(codes
          .filter(item => item.comCd === 'RCP_CTG')
          .map(item => ({ code: item.comDtlCd, name: item.comDtlDesc || item.comDtlNm })));
      })
      .catch(error => {
        if (mounted) console.warn('레시피 분류 공통코드 조회 실패', error);
      })
      .finally(() => {
        if (mounted) setCommonCodesLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const refreshRecipes = useCallback(async () => {
    const requestId = ++recipeRequestId.current;
    const rows = await getRecipes({
      scope: queryScope,
      query: searchText.trim(),
      categoryCode: selectedCategoryCode,
      limit: 50,
    });
    if (requestId !== recipeRequestId.current) return;
    setRecipes(rows.map(toRecipe));
    if (queryScope === 'mine') {
      const savedRows = await getRecipes({ scope: 'saved', limit: 100 });
      if (requestId === recipeRequestId.current) setSavedCount(savedRows.length);
    }
  }, [queryScope, searchText, selectedCategoryCode]);

  useEffect(() => {
    if (page !== 'tab') return undefined;
    let active = true;
    const timer = setTimeout(() => setLoading(true), 500);
    const debounce = setTimeout(() => {
      void refreshRecipes()
        .catch(error => {
          if (active) Alert.alert('레시피', error instanceof Error ? error.message : getMsg('COMMON', '023'));
        })
        .finally(() => {
          clearTimeout(timer);
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      recipeRequestId.current += 1;
      clearTimeout(timer);
      clearTimeout(debounce);
      setLoading(false);
    };
  }, [getMsg, page, refreshRecipes]);

  useEffect(() => {
    setPage('tab');
    setSelectedRecipeId('');
    setDetailRecipe(null);
    setSearchText('');
    setSelectedCategory('전체');
  }, [activeTab]);

  const openRecipe = async (recipe: Recipe) => {
    const requestId = ++detailRequestId.current;
    setSelectedRecipeId(recipe.id);
    setDetailRecipe(recipe);
    setPage('detail');
    if (!recipe.postSeq) return;
    const timer = setTimeout(() => setLoading(true), 500);
    try {
      const row = await getRecipe(recipe.postSeq);
      if (requestId === detailRequestId.current) setDetailRecipe(toRecipe(row));
    } catch (error) {
      if (requestId === detailRequestId.current) {
        Alert.alert('레시피', error instanceof Error ? error.message : getMsg('COMMON', '023'));
      }
    } finally {
      clearTimeout(timer);
      if (requestId === detailRequestId.current) setLoading(false);
    }
  };

  const toggleSaved = async (recipeId: string) => {
    const target = recipes.find(recipe => recipe.id === recipeId) ?? detailRecipe;
    if (!target?.postSeq) return;
    const enabled = !target.savedByMe;
    try {
      await setRecipeSaved(target.postSeq, enabled);
      setRecipes(current => current.map(recipe => recipe.id === recipeId
        ? { ...recipe, savedByMe: enabled, saves: Math.max(0, recipe.saves + (enabled ? 1 : -1)) }
        : recipe));
      setDetailRecipe(current => current?.id === recipeId
        ? { ...current, savedByMe: enabled, saves: Math.max(0, current.saves + (enabled ? 1 : -1)) }
        : current);
      if (queryScope === 'saved' && !enabled) {
        setRecipes(current => current.filter(recipe => recipe.id !== recipeId));
      }
      if (queryScope === 'mine') {
        setSavedCount(current => Math.max(0, current + (enabled ? 1 : -1)));
      }
    } catch (error) {
      Alert.alert('레시피', error instanceof Error ? error.message : getMsg('COMMON', '023'));
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', getMsg('AUTH', '004'), [
      { text: '취소', style: 'cancel' },
      { text: '확인', onPress: processLogout },
    ]);
  };

  const processLogout = async () => {
    setLoggingOut(true);
    try {
      const credentials = await getAuthCredentials();
      if (credentials) await logout(credentials.password);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setLoggingOut(false);
      await clearAuthCredentials();
      Alert.alert('로그아웃', getMsg('AUTH', '005'), [{ text: '확인', onPress: onLogout }]);
    }
  };

  const addRecipe = (draft: RecipeDraft) => {
    const recipe: Recipe = {
      id: `local-${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description.trim() || '나만의 레시피를 공유해요.',
      category: draft.category,
      cookingMinutes: Number(draft.cookingMinutes) || 20,
      rating: '0',
      saves: 0,
      author: '나',
      authorInitial: '나',
      emoji: '🍳',
      artwork: '#EFC77C',
      ingredients: draft.ingredients.map(item => {
        const amount = item.amount.trim();
        const measurement = amount ? ` ${amount}${item.unitName ? ` ${item.unitName}` : ''}` : '';
        return `${item.ingredientName}${measurement}`;
      }),
      ingredientItems: draft.ingredients,
      steps: draft.steps.split('\n').map(item => item.trim()).filter(Boolean),
      isMine: true,
    };
    setRecipes(current => [recipe, ...current]);
    setDetailRecipe(recipe);
    setSelectedRecipeId(recipe.id);
    setPage('detail');
  };

  const commonRecipeProps = {
    savedIds,
    categories,
    onOpenRecipe: openRecipe,
    onToggleSaved: toggleSaved,
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return (
          <RecipeHomeScreen
            recipes={recipes}
            filteredRecipes={recipes}
            searchText={searchText}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchText}
            onCategoryChange={setSelectedCategory}
            onWrite={() => setPage('write')}
            {...commonRecipeProps}
          />
        );
      case 'search':
        return (
          <RecipeSearchScreen
            recipes={recipes}
            searchText={searchText}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchText}
            onCategoryChange={setSelectedCategory}
            {...commonRecipeProps}
          />
        );
      case 'saved':
        return <RecipeSavedScreen recipes={recipes} {...commonRecipeProps} />;
      case 'myRecipes':
        return (
          <MyRecipesScreen
            recipes={recipes}
            savedCount={savedCount}
            onWrite={() => setPage('write')}
            onLogout={handleLogout}
            {...commonRecipeProps}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {page === 'detail' && selectedRecipe ? (
        <RecipeDetailScreen
          recipe={selectedRecipe}
          saved={Boolean(selectedRecipe.savedByMe)}
          onBack={() => setPage('tab')}
          onToggleSaved={() => { void toggleSaved(selectedRecipe.id); }}
        />
      ) : page === 'write' ? (
        <RecipeCreateScreen
          onBack={() => setPage('tab')}
          onSubmit={addRecipe}
          commonCodes={commonCodes}
          commonCodesLoading={commonCodesLoading}
          categories={categories}
        />
      ) : renderTab()}
      <BrandLoader visible={loading || loggingOut} />
    </View>
  );
}

function toRecipe(row: RecipeResponse): Recipe {
  const initials = row.authorName?.trim().slice(0, 1) || '한';
  return {
    id: String(row.postSeq),
    postSeq: row.postSeq,
    title: row.title,
    description: row.description || '',
    category: row.categoryName || '레시피',
    categoryCode: row.categoryCode,
    cookingMinutes: row.cookingMinutes ?? 0,
    rating: String(row.likeCount ?? 0),
    likeCount: row.likeCount ?? 0,
    saves: row.saveCount ?? 0,
    author: row.authorName || '한끼모아 사용자',
    authorId: row.authorId,
    authorInitial: initials,
    emoji: '🍲',
    artwork: '#D8A45B',
    ingredients: (row.ingredients ?? []).map(item => {
      const quantity = item.ingrAmt == null ? '' : ` ${item.ingrAmt}${item.unitName ? ` ${item.unitName}` : ''}`;
      const note = item.note ? ` · ${item.note}` : '';
      return `${item.ingrName}${quantity}${note}`;
    }),
    steps: (row.steps ?? []).map(step => step.content),
    servings: row.servings,
    difficulty: row.difficultyName,
    savedByMe: row.savedByMe,
    isMine: row.mine,
  };
}

export default RecipeAppScreen;
