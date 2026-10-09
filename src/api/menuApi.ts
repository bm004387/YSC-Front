import { API_BASE_URL } from '../config/environment';

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

export async function getBottomMenuList(): Promise<MenuItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/menu/bottom`);

  if (!response.ok) {
    throw new Error(`메뉴 조회에 실패했습니다. (${response.status})`);
  }

  return response.json();
}

export async function getAllMenuList(): Promise<MenuItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/menu/all`);

  if (!response.ok) {
    throw new Error(`전체 메뉴 조회에 실패했습니다. (${response.status})`);
  }

  return response.json();
}
