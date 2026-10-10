import {getCommonCodeList, type CommonCodeItem} from '../api/commonCodeApi';

const codeCache = new Map<string, CommonCodeItem>();
let loadPromise: Promise<void> | null = null;

const cacheKey = (comCd: string, comDtlCd: string) =>
  `${comCd.trim().toUpperCase()}:${comDtlCd.trim().padStart(3, '0')}`;

/** 사용 중인 공통코드를 서버에서 읽어 앱 메모리에 보관합니다. */
export async function loadCommonCodes(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = getCommonCodeList()
    .then(items => {
      codeCache.clear();
      items.forEach(item => codeCache.set(cacheKey(item.comCd, item.comDtlCd), item));
    })
    .catch(error => {
      loadPromise = null;
      throw error;
    });

  return loadPromise;
}

/** 분류코드와 상세코드로 공통코드명을 조회합니다. */
export async function getCommonCodeName(
  comCd: string,
  comDtlCd: string,
): Promise<string> {
  await loadCommonCodes();
  const item = codeCache.get(cacheKey(comCd, comDtlCd));
  if (!item) throw new Error(`공통코드를 찾을 수 없습니다: ${comCd}/${comDtlCd}`);
  return item.comDtlNm;
}

/** 이미 적재된 공통코드명을 화면 렌더링 중 동기 조회합니다. */
export function getCachedCommonCodeName(
  comCd: string,
  comDtlCd: string,
): string | undefined {
  return codeCache.get(cacheKey(comCd, comDtlCd))?.comDtlNm;
}

/** 분류코드와 상세코드로 화면 표시용 설명을 조회합니다. */
export async function getCommonCodeDescription(
  comCd: string,
  comDtlCd: string,
): Promise<string> {
  await loadCommonCodes();
  const item = codeCache.get(cacheKey(comCd, comDtlCd));
  if (!item) throw new Error(`공통코드를 찾을 수 없습니다: ${comCd}/${comDtlCd}`);
  return item.comDtlDesc;
}

/** 분류코드에 등록된 코드값을 모두 반환합니다. */
export async function getCommonCodeValues(comCd: string): Promise<string[]> {
  await loadCommonCodes();
  const group = comCd.trim().toUpperCase();
  return [...codeCache.values()]
    .filter(item => item.comCd.toUpperCase() === group)
    .map(item => item.comDtlNm);
}

/** 등록된 코드값인지 확인합니다. */
export async function isCommonCodeValue(
  comCd: string,
  value: string | null | undefined,
): Promise<boolean> {
  if (!value) return false;
  const values = await getCommonCodeValues(comCd);
  return values.includes(value);
}

/** 캐시에 적재된 코드값인지 동기 확인합니다. */
export function isCachedCommonCodeValue(
  comCd: string,
  value: string | null | undefined,
): boolean {
  if (!value) return false;
  const group = comCd.trim().toUpperCase();
  return [...codeCache.values()].some(
    item => item.comCd.toUpperCase() === group && item.comDtlNm === value,
  );
}
