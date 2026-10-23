import { API_BASE_URL } from '../config/environment';
import { authenticatedFetch, getRequiredAccessToken } from './apiClient';
import { getCachedMsg } from '../utils/msgUtil';

export interface RecipeIngredientResponse {
  sortOrd: number;
  ingrSeq: number | null;
  ingrName: string;
  ingrAmt: number | null;
  unitCode: string | null;
  unitName: string | null;
  note: string | null;
}

export interface RecipeStepResponse {
  stepNo: number;
  content: string;
  cookSec: number | null;
  stepFilSeq: number | null;
}

export interface RecipeResponse {
  postSeq: number;
  title: string;
  description: string;
  categoryCode: string;
  categoryName: string;
  cookingMinutes: number;
  servings: number | null;
  difficultyCode: string;
  difficultyName: string;
  authorId: string;
  authorName: string;
  profileImageFilSeq: number | null;
  createdAt: string;
  likeCount: number;
  saveCount: number;
  savedByMe: boolean;
  mine: boolean;
  ingredients: RecipeIngredientResponse[];
  steps: RecipeStepResponse[];
}

export interface RecipeQuery {
  scope: 'all' | 'mine' | 'saved';
  query?: string;
  categoryCode?: string;
  limit?: number;
}

async function throwApiError(response: Response): Promise<never> {
  const payload = await response.json().catch(() => null) as { message?: string; detail?: string } | null;
  throw new Error(payload?.message || payload?.detail || getCachedMsg('COMMON', '023'));
}

/** 인증된 사용자의 레시피 목록을 조회합니다. */
export async function getRecipes(query: RecipeQuery): Promise<RecipeResponse[]> {
  const accessToken = await getRequiredAccessToken();
  const params = new URLSearchParams({
    scope: query.scope,
    query: query.query ?? '',
    limit: String(query.limit ?? 50),
  });
  if (query.categoryCode) {
    params.set('categoryCode', query.categoryCode);
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/api/recipes?${params.toString()}`, accessToken);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

/** 레시피 상세와 재료·조리 순서를 조회합니다. */
export async function getRecipe(postSeq: number): Promise<RecipeResponse> {
  const accessToken = await getRequiredAccessToken();
  const response = await authenticatedFetch(`${API_BASE_URL}/api/recipes/${postSeq}`, accessToken);
  if (!response.ok) {
    await throwApiError(response);
  }
  return response.json();
}

/** 레시피를 저장하거나 저장 취소합니다. */
export async function setRecipeSaved(postSeq: number, enabled: boolean): Promise<void> {
  const accessToken = await getRequiredAccessToken();
  const response = await authenticatedFetch(`${API_BASE_URL}/api/recipes/${postSeq}/save`, accessToken, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  if (!response.ok) {
    await throwApiError(response);
  }
}
