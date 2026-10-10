import { API_BASE_URL } from '../config/environment';

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

/** PIN 설정 전에 가입 시 사용한 비밀번호를 검증해 PIN을 서버에 저장합니다. */
export async function setupPin(
  usrId: string,
  pwd: string,
  pin: string,
): Promise<void> {
  await request<void>('/api/auth/pin/setup', {
    method: 'POST',
    body: JSON.stringify({usrId, pwd, pin}),
  });
}

/** 로그아웃 후 또는 PIN 미설정 계정을 비밀번호로 인증합니다. */
export async function loginWithPassword(usrId: string, pwd: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({usrId, pwd}),
  });
}

/** 보관된 Redis 세션 토큰이 여전히 유효한지 확인합니다. */
export async function validateSession(token: string): Promise<void> {
  await request<void>('/api/auth/session', {
    method: 'GET',
    headers: {Authorization: `Bearer ${token}`},
  });
}

/** 아이디와 PIN을 확인하고 Redis 세션 토큰을 발급받습니다. */
export async function loginWithPin(
  usrId: string,
  pin: string,
  sessionId?: string,
): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/pin/login', {
    method: 'POST',
    body: JSON.stringify({usrId, pin, sessionId}),
  });
}

export const logout = async (
  accessToken: string,
): Promise<{
  message: string;
}> => {

  const response = await fetch(
    `${API_BASE_URL}/api/auth/logout`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? `로그아웃에 실패했습니다. (${response.status})`);
  }

  return data;
};

export const checkUsrId =
  async (
    usrId: string,
  ): Promise<{
    available: boolean;
  }> => {

    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/check-user-id?usrId=${encodeURIComponent(usrId,)}`,
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ??
          `아이디 중복확인에 실패했습니다. (${response.status})`,
      );
    }

    return data;
  };

export const signup =
  async (
    usrId: string,
    pwd: string,
    usrNm: string,
    hpNo: string,
    adr: string,
    dtlAdr: string,
  ) => {

    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            usrId,
            pwd,
            usrNm,
            hpNo,
            adr,
            dtlAdr,
          }),
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ??
          `회원가입에 실패했습니다. (${response.status})`,
      );
    }

    return data;
  };

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {

  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers: {
          'Content-Type':
            'application/json',
          ...(options.headers ?? {}),
        },
      },
    );

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        data.detail ??
        `요청에 실패했습니다. (${response.status})`,
    );
  }

  return data as T;
}
