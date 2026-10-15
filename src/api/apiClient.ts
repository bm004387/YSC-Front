import { clearAuthCredentials, getAuthCredentials } from '../storage/tokenStorage';
import { getCachedMsg } from '../utils/msgUtil';

type HeaderRecord = Record<string, string>;

export class AuthExpiredError extends Error {
  constructor() {
    super(getCachedMsg('MYINFO', '009'));
    this.name = 'AuthExpiredError';
  }
}

export class AuthRequiredError extends Error {
  constructor() {
    super('MYINFO:009');
    this.name = 'AuthRequiredError';
  }
}

let authExpiredHandler: (() => void) | null = null;
let expiredToken: string | null = null;

/** 세션 만료 시 로그인 화면으로 복귀할 콜백을 등록합니다. */
export function registerAuthExpiredHandler(handler: () => void): () => void {
  authExpiredHandler = handler;
  return () => {
    if (authExpiredHandler === handler) {
      authExpiredHandler = null;
    }
  };
}

/** 새 로그인이 완료되면 이전 토큰 만료 표시를 해제합니다. */
export function resetAuthExpiredState(): void {
  expiredToken = null;
}

/** Keychain에서 현재 세션 토큰을 가져옵니다. */
export async function getRequiredAccessToken(): Promise<string> {
  const credentials = await getAuthCredentials();
  if (!credentials || !credentials.password) {
    throw new AuthRequiredError();
  }
  return credentials.password;
}

/** 보호 API에 Bearer 토큰을 붙이고, 만료된 토큰을 공통 처리합니다. */
export async function authenticatedFetch(url: string, accessToken: string,
                                        options: RequestInit = {}): Promise<Response> {
  if (!accessToken) {
    throw new AuthRequiredError();
  }

  const headers = toHeaderRecord(options.headers);
  headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await handleExpiredToken(accessToken);
    throw new AuthExpiredError();
  } else if (response.ok && expiredToken !== accessToken) {
    expiredToken = null;
  }

  return response;
}

async function handleExpiredToken(accessToken: string): Promise<void> {
  if (expiredToken === accessToken) {
    return;
  }

  expiredToken = accessToken;
  await clearAuthCredentials();
  authExpiredHandler?.();
}

function toHeaderRecord(headers?: RequestInit['headers']): HeaderRecord {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    const result: HeaderRecord = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers) as HeaderRecord;
  }

  return { ...headers };
}
