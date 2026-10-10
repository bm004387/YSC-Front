import {API_BASE_URL} from '../config/environment';

export interface CommonCodeItem {
  comCd: string;
  comCdNm: string;
  comDtlCd: string;
  comDtlNm: string;
  comDtlDesc: string;
  sortOrd: number;
}

export async function getCommonCodeList(): Promise<CommonCodeItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/common-codes/all`);
  if (!response.ok) {
    throw new Error(`공통코드 조회에 실패했습니다. (${response.status})`);
  }
  return response.json();
}
