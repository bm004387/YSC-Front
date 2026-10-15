import { API_BASE_URL } from '../config/environment';
import { authenticatedFetch } from './apiClient';
import { getCachedMsg } from '../utils/msgUtil';

interface LoginUser {
  usrId: string;
  usrNm: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: LoginUser;
}

/** 가입 시 사용한 비밀번호를 검증하고 PIN을 서버에 저장합니다. */
export async function setupPin(usrId: string, pwd: string, pin: string): Promise<void> {
  await request<void>('/api/auth/pin/setup', {
    method: 'POST',
    body: JSON.stringify({ usrId, pwd, pin }),
  });
}

/** 로그아웃 후 또는 PIN 미설정 계정을 비밀번호로 인증합니다. */
export async function loginWithPassword(usrId: string, pwd: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usrId, pwd }),
  });
}

/** 보관된 Redis 세션 토큰이 여전히 유효한지 확인합니다. */
export async function validateSession(token: string): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/auth/session`, token, {
    method: 'GET',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message ?? getCachedMsg('COMMON', '023'));
  }
}

/** 아이디와 PIN을 확인하고 Redis 세션 토큰을 발급받습니다. */
export async function loginWithPin(usrId: string, pin: string, sessionId?: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/pin/login', {
    method: 'POST',
    body: JSON.stringify({ usrId, pin, sessionId }),
  });
}

export const logout = async (accessToken: string): Promise<{ message: string }> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/auth/logout`, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? getCachedMsg('COMMON', '023'));
  }

  return data;
};

export const checkUsrId = async (usrId: string): Promise<{ available: boolean }> => {
  const url = `${API_BASE_URL}/api/auth/check-user-id?usrId=${encodeURIComponent(usrId)}`;
  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? getCachedMsg('SIGNUP', '004'));
  }

  return data;
};

export const signup = async (usrId: string, pwd: string, nckNm: string, hpNo: string,
                             adr: string, dtlAdr: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usrId,
      pwd,
      nckNm,
      hpNo,
      adr,
      dtlAdr,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? getCachedMsg('SIGNUP', '004'));
  }

  return data;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const fallbackMessage = path === '/api/auth/login'
      ? getCachedMsg('AUTH', '001')
      : path === '/api/auth/pin/login'
      ? getCachedMsg('AUTH', '008')
      : getCachedMsg('SIGNUP', '004');
    throw new Error(data.message ?? data.detail ?? fallbackMessage);
  }

  return data as T;
}
