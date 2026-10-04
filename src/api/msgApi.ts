const BASE_URL = 'http://192.168.10.122:8080';

export const getMsgList = async (
  menuId: string,
): Promise<Record<string, string>> => {

  const response = await fetch(
    `${BASE_URL}/api/msg/${menuId}`,
  );

  if (!response.ok) {
    throw new Error('메시지 조회에 실패했습니다.');
  }

  return await response.json();
};