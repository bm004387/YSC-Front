import { API_BASE_URL } from '../config/environment';
import { authenticatedFetch } from './apiClient';
import { getCachedMsg } from '../utils/msgUtil';

export interface MenuItem {
  menuId: string;
  menuName: string;
  upperMenuId?: string | null;
  menuLevel?: number;
  sortOrder?: number;
  menuType?: string;
  iconName?: string | null;
  programCode?: string | null;
  programUrl: string | null;
}

export async function getBottomMenuList(accessToken: string): Promise<MenuItem[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/menu/bottom`, accessToken);

  if (!response.ok) {
    throw new Error(getCachedMsg('COMMON', '023'));
  }

  return response.json();
}

export async function getAllMenuList(accessToken: string): Promise<MenuItem[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/menu/all`, accessToken);

  if (!response.ok) {
    throw new Error(getCachedMsg('COMMON', '023'));
  }

  return response.json();
}
