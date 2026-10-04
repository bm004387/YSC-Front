// const API_BASE_URL = 'http://192.168.10.122:8080';
const API_BASE_URL = 'https://ysc-dev.duckdns.org';

export interface UserInfo {
  userId: string;
  userName: string;
  role: string;
}

export interface UserIdCheckResponse {
  available: boolean;
  message: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    },
  );

  const data = await response
    .json()
    .catch(() => ({}));
    if (!response.ok) {
    const message =
      data.detail ??
      data.message ??
      `요청에 실패했습니다. (${response.status})`;

    throw new Error(message);
  }

  return data as T;
}

export async function checkUserId(
  userId: string,
): Promise<UserIdCheckResponse> {

  return request<UserIdCheckResponse>(
    `/api/auth/check-user-id?userId=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
    },
  );
}

/**
 * 회원가입
 */
export async function signup(
  userId: string,
  passwd: string,
  userName: string,
): Promise<SignupResponse> {
  return request<SignupResponse>(
    '/api/auth/signup',
    {
      method: 'POST',
      body: JSON.stringify({
        userId,
        passwd,
        userName,
      }),
    },
  );
}

/**
 * 로그인
 */
export async function login(
  userId: string,
  passwd: string,
): Promise<LoginResponse> {
  return request<LoginResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        userId,
        passwd,
      }),
    },
  );
}

/**
 * 내 정보 조회
 */
export async function getMyInfo(
  token: string,
): Promise<UserInfo> {
  return request<UserInfo>(
    '/api/user/me',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}

/**
 * 로그아웃
 */
export async function logout(
  token: string,
): Promise<void> {
  await request<{message: string}>(
    '/api/auth/logout',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}