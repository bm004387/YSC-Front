import { API_BASE_URL } from '../config/environment';
import { authenticatedFetch, getRequiredAccessToken } from './apiClient';
import { getCachedMsg } from '../utils/msgUtil';

export interface CommonCodeItem {
  comCd: string;
  comCdNm: string;
  comCdSortOrd?: number;
  comDtlCd: string;
  comDtlNm: string;
  comDtlDesc: string;
  sortOrd: number;
}

export async function getCommonCodeList(): Promise<CommonCodeItem[]> {
  const accessToken = await getRequiredAccessToken();
  const response = await authenticatedFetch(`${API_BASE_URL}/api/common-codes/all`, accessToken);
  if (!response.ok) {
    throw new Error(getCachedMsg('COMMON', '023'));
  }
  return response.json();
}
