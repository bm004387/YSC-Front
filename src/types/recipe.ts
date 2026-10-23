export type RecipeTab = 'home' | 'search' | 'saved' | 'myRecipes';

export interface Recipe {
  id: string;
  postSeq?: number;
  title: string;
  description: string;
  category: string;
  categoryCode?: string;
  cookingMinutes: number;
  rating: string;
  likeCount?: number;
  saves: number;
  author: string;
  authorId?: string;
  authorInitial: string;
  emoji: string;
  artwork: string;
  ingredients: string[];
  ingredientItems?: RecipeIngredientDraft[];
  steps: string[];
  servings?: number | null;
  difficulty?: string;
  savedByMe?: boolean;
  isMine?: boolean;
}

export interface RecipeCategory {
  code: string;
  name: string;
}

export interface RecipeDraft {
  title: string;
  description: string;
  category: string;
  cookingMinutes: string;
  ingredients: RecipeIngredientDraft[];
  steps: string;
}

export interface RecipeIngredientDraft {
  ingredientGroupCode: string;
  ingredientCode: string;
  ingredientName: string;
  amount: string;
  unitCode: string;
  unitName: string;
}

export const RECIPE_CATEGORIES = ['전체', '집밥', '간단요리', '한그릇', '디저트'];
