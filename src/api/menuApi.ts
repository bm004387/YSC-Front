const BASE_URL = 'https://ysc-dev.duckdns.org';

export interface MenuItem {
  menuId: string;
  menuName: string;
  iconName: string;
  programCode: string;
  programUrl: string;
}

export async function getBottomMenuList(): Promise<MenuItem[]> {
  const response = await fetch(`${BASE_URL}/api/menu/bottom`);

  if (!response.ok) {
    throw new Error(`메뉴 조회에 실패했습니다. (${response.status})`);
  }

  return response.json();
}
